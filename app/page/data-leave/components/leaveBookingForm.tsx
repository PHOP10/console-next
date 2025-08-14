"use client";

import React from "react";
import { Button, Card, DatePicker, Form, Input, message } from "antd";
import dayjs from "dayjs";
import { DataLeaveType } from "../../common";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface LeaveBookingFormProps {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  createDataLeave: (body: any) => Promise<any>;
}

export default function LeaveBookingForm({
  loading,
  setLoading,
  createDataLeave,
}: LeaveBookingFormProps) {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const payload = {
      reason: values.reason,
      leaveDateStart: values.leaveDates?.[0]
        ? values.leaveDates[0].toISOString()
        : null,
      leaveDateEnd: values.leaveDates?.[1]
        ? values.leaveDates[1].toISOString()
        : null,
      details: values.details || null,
    };

    try {
      setLoading(true);
      await createDataLeave(payload);
      message.success("บันทึกใบลาสำเร็จ");
      form.resetFields();
    } catch (err) {
      message.error("ไม่สามารถบันทึกใบลาได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="ยื่นใบลา">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 600, margin: "0 auto" }}
      >
        <Form.Item
          label="เหตุผลการลา"
          name="reason"
          rules={[{ required: true, message: "กรุณากรอกเหตุผลการลา" }]}
        >
          <Input placeholder="เช่น ลาป่วย" />
        </Form.Item>

        <Form.Item
          label="ช่วงวันที่ลา"
          name="leaveDates"
          rules={[{ required: true, message: "กรุณาเลือกช่วงวันที่ลา" }]}
        >
          <RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="รายละเอียดเพิ่มเติม" name="details">
          <TextArea rows={4} placeholder="เช่น มีใบรับรองแพทย์" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            ส่งใบลา
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
