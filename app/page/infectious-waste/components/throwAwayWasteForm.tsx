"use client";

import { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  message,
  Card,
  Select,
} from "antd";
import { infectiousWasteServices } from "../services/infectiouswaste.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";
import th_TH from "antd/es/date-picker/locale/th_TH";
dayjs.extend(buddhistEra);
dayjs.locale("th");

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ThrowAwayWasteForm({ setLoading }: Props) {
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

      message.success("เพิ่มรายการขยะติดเชื้อสำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error("Error creating waste:", error);
      message.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="ทิ้งขยะติดเชื้อ">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          discardedDate: dayjs(),
        }}
      >
        <Form.Item
          label="ประเภทขยะติดเชื้อ"
          name="wasteType"
          rules={[{ required: true, message: "กรุณาระบุประเภทขยะ" }]}
        >
          <Select placeholder="เลือกประเภทขยะ">
            <Select.Option value="ขยะติดเชื้อทั่วไป">
              ขยะติดเชื้อทั่วไป
            </Select.Option>
            <Select.Option value="ขยะติดเชื้อมีคม">
              ขยะติดเชื้อมีคม
            </Select.Option>
          </Select>
        </Form.Item>

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
          <Input placeholder="เช่น 1.25" />
        </Form.Item>

        <Form.Item
          label="วันที่ทิ้งขยะ"
          name="discardedDate"
          rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
        >
          <DatePicker
            locale={th_TH}
            format="D MMMM BBBB" // BBBB = ปีพุทธศักราช
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            บันทึกข้อมูล
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
