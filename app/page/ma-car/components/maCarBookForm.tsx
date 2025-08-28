"use client";

import React from "react";
import { Form, Input, DatePicker, InputNumber, Button, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";

interface MaCarBookFormProps {
  car: any;
}

const MaCarBookForm: React.FC<MaCarBookFormProps> = ({ car }) => {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        carId: car.id,
        status: "pending",
      };
      await intraAuthService.createMaCar(payload);
      message.success("จองรถสำเร็จ");
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถจองรถได้");
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="requesterName"
        label="ผู้ขอใช้รถ"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="purpose"
        label="วัตถุประสงค์"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="departureDate"
        label="วันเริ่มเดินทาง"
        rules={[{ required: true }]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="returnDate" label="วันกลับ" rules={[{ required: true }]}>
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="destination"
        label="ปลายทาง"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="passengers"
        label="จำนวนผู้โดยสาร"
        rules={[{ required: true }]}
      >
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="budget" label="งบประมาณ">
        <InputNumber min={0} step={100} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          จองรถ
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MaCarBookForm;
