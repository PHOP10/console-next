"use client";

import { useState } from "react";
import { Form, Input, DatePicker, Button, message, Card, Select } from "antd";
import { infectiousWasteServices } from "../services/infectiouswaste.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";
import th_TH from "antd/es/date-picker/locale/th_TH";
import { buddhistLocale } from "@/app/common";
dayjs.extend(buddhistEra);
dayjs.locale("th");

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fetchData: () => Promise<void>;
};

export default function ThrowAwayWasteForm({ setLoading, fetchData }: Props) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const { data: session } = useSession();
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);

      const payload = {
        wasteType: values.wasteType,
        wasteWeight: parseFloat(values.wasteWeight),
        discardedDate: values.discardedDate.toISOString(),
        createdName: session?.user?.fullName,
      };

      await intraAuthService.createInfectiousWaste(payload);
      setLoading(true);
      fetchData();
      message.success("เพิ่มรายการขยะติดเชื้อสำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error("Error creating waste:", error);
      message.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Style Constant (ตามแบบฉบับ Master Template) ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  return (
    <Card>
      <div className="flex justify-center">
        <div className="w-full max-w-[350px]">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ discardedDate: dayjs() }}
          >
            {/* 1. Select Type */}
            <Form.Item
              label="ประเภทขยะติดเชื้อ"
              name="wasteType"
              rules={[{ required: true, message: "กรุณาระบุประเภทขยะ" }]}
            >
              <Select
                placeholder="เลือกประเภทขยะ"
                className="h-11 [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm"
                options={[
                  { value: "ขยะติดเชื้อทั่วไป", label: "ขยะติดเชื้อทั่วไป" },
                  { value: "ขยะติดเชื้อมีคม", label: "ขยะติดเชื้อมีคม" },
                ]}
              />
            </Form.Item>

            {/* 2. Weight Input */}
            <Form.Item
              label="น้ำหนักขยะติดเชื้อ (กิโลกรัม)"
              name="wasteWeight"
              rules={[
                { required: true, message: "กรุณาระบุน้ำหนักขยะ" },
                {
                  pattern: /^\d+(\.\d{1,2})?$/,
                  message: "กรุณากรอกตัวเลข เช่น 1.25",
                },
              ]}
            >
              <Input placeholder="เช่น 1.25" className={inputStyle} />
            </Form.Item>

            {/* 3. Date Picker */}
            <Form.Item
              label="วันที่ทิ้งขยะ"
              name="discardedDate"
              rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
            >
              <DatePicker
                locale={buddhistLocale}
                format="D MMMM BBBB"
                placeholder="เลือกวันที่"
                style={{ width: "100%" }}
                className="h-11 shadow-sm rounded-xl border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:shadow-md"
              />
            </Form.Item>

            {/* Submit Button */}
            <Form.Item className="text-center mb-0 mt-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                className="h-9 px-4 rounded-lg text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                บันทึกข้อมูล
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Card>
  );
}
