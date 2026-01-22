"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Row,
  Col,
  message,
  Button,
  ConfigProvider,
} from "antd";
import dayjs from "dayjs";
import { MaDrugType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import th_TH from "antd/locale/th_TH";

interface MaDrugEditProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  data: MaDrugType | null;
}

export default function MaDrugEdit({
  visible,
  onClose,
  onSuccess,
  data,
}: MaDrugEditProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  useEffect(() => {
    if (visible && data) {
      form.setFieldsValue({
        requestNumber: data.requestNumber,
        requestDate: data.requestDate ? dayjs(data.requestDate) : null,
        requestUnit: data.requestUnit,
        roundNumber: data.roundNumber,
        note: data.note,
      });
    }
  }, [visible, data, form]);

  const onFinish = async (values: any) => {
    if (!data) return;

    try {
      setLoading(true);

      const payload = {
        id: data.id,
        requestNumber: values.requestNumber,
        requestDate: values.requestDate.toISOString(),
        requestUnit: values.requestUnit,
        roundNumber: values.roundNumber,
        note: values.note,
      };

      await intraAuthService.updateMaDrug(payload);

      message.success("แก้ไขข้อมูลสำเร็จ");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating:", error);
      message.error("แก้ไขข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // --- Style Constants ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  return (
    <Modal
      title={
        <div className="text-xl font-bold text-[#0683e9] text-center w-full">
          แก้ไขข้อมูลการเบิกจ่ายยา
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
      styles={{
        content: { borderRadius: "20px", padding: "24px" },
        header: {
          marginBottom: "16px",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "12px",
        },
      }}
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="เลขที่เบิก"
                name="requestNumber"
                rules={[{ required: true, message: "กรุณากรอกเลขที่เบิก" }]}
              >
                <Input placeholder="กรอกเลขที่เบิก" className={inputStyle} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="วันที่ขอเบิก"
                name="requestDate"
                rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-2`}
                  placeholder="เลือกวันที่"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="หน่วยงานที่เบิก"
                name="requestUnit"
                rules={[{ required: true, message: "กรุณากรอกหน่วยงาน" }]}
              >
                <Input
                  placeholder="กรอกหน่วยงานที่เบิก"
                  className={inputStyle}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="เบิกครั้งที่"
                name="roundNumber"
                rules={[{ required: true, message: "กรุณากรอกครั้งที่เบิก" }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-1`}
                  placeholder="1"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea
              rows={2}
              placeholder="กรอกหมายเหตุ"
              className={textAreaStyle}
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              onClick={onClose}
              className="h-10 px-6 rounded-lg text-gray-600 hover:bg-gray-100 border-gray-300"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0"
            >
              บันทึกการแก้ไข
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
}
