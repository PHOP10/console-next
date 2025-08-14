"use client";

import React from "react";
import { Form, Input, InputNumber, Button, message, Card } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import TypedInputNumber from "antd/es/input-number";

export default function DrugForm() {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  const onFinish = async (values: any) => {
    try {
      await intraAuthService.createDrug(values);
      message.success("เพิ่มข้อมูลยาสำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("เพิ่มข้อมูลยาไม่สำเร็จ");
    }
  };

  return (
    <Card title="เพิ่มข้อมูลยา">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        // style={{ maxWidth: 600 }}
      >
        <Form.Item
          label="รหัสยา (DrugId)"
          name="DrugId"
          rules={[{ required: true, message: "กรุณากรอกรหัสยา" }]}
        >
          <TypedInputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Working Code"
          name="workingCode"
          rules={[{ required: true, message: "กรุณากรอก Working Code" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="ชื่อยา"
          name="name"
          rules={[{ required: true, message: "กรุณากรอกชื่อยา" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="รหัสประเภทยา (drugTypeId)"
          name="drugTypeId"
          rules={[{ required: true, message: "กรุณากรอกรหัสประเภทยา" }]}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="ขนาดบรรจุ"
          name="packagingSize"
          rules={[{ required: true, message: "กรุณากรอกขนาดบรรจุ" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="ราคา/หน่วย"
          name="price"
          rules={[{ required: true, message: "กรุณากรอกราคา" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
        </Form.Item>

        <Form.Item
          label="จำนวนคงเหลือ"
          name="quantity"
          rules={[{ required: true, message: "กรุณากรอกจำนวนคงเหลือ" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item label="หมายเหตุ" name="note">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            บันทึกข้อมูลยา
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
