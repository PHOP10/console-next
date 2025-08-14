"use client";

import React from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  message,
  Space,
  Card,
} from "antd";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
};

export default function SupportingResourceForm({ setLoading, loading }: Props) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        acquiredDate: values.acquiredDate
          ? values.acquiredDate.toISOString()
          : null,
      };
      await intraAuthService.createSupportingResource(payload);
      setLoading(true);
      message.success("บันทึกข้อมูลวัสดุสนับสนุนสำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error(error);
      setLoading(false);
      message.error("บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  return (
    <Card title="ข้อมูลวัสดุสนับสนุน">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: "พร้อมใช้งาน",
        }}
      >
        <Form.Item
          label="รหัสวัสดุ"
          name="code"
          rules={[{ required: true, message: "กรุณากรอกรหัสวัสดุ" }]}
        >
          <Input placeholder="เช่น SR-001" />
        </Form.Item>

        <Form.Item
          label="ชื่อวัสดุ"
          name="name"
          rules={[{ required: true, message: "กรุณากรอกชื่อวัสดุ" }]}
        >
          <Input placeholder="เช่น หน้ากากอนามัย" />
        </Form.Item>

        <Form.Item
          label="สถานะ"
          name="status"
          rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}
        >
          <Select>
            <Select.Option value="พร้อมใช้งาน">พร้อมใช้งาน</Select.Option>
            <Select.Option value="ชำรุด">ชำรุด</Select.Option>
            <Select.Option value="ใช้แล้วหมด">ใช้แล้วหมด</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="วันที่ได้รับ"
          name="acquiredDate"
          rules={[{ required: true, message: "กรุณาเลือกวันที่ได้รับ" }]}
        >
          <DatePicker format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          label="วิธีที่ได้มา"
          name="acquisitionType"
          rules={[{ required: true, message: "กรุณาเลือกวิธีที่ได้มา" }]}
        >
          <Select>
            <Select.Option value="บริจาค">บริจาค</Select.Option>
            <Select.Option value="โครงการสนับสนุน">
              โครงการสนับสนุน
            </Select.Option>
            <Select.Option value="จัดสรรจากส่วนกลาง">
              จัดสรรจากส่วนกลาง
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="รายละเอียดเพิ่มเติม" name="description">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              บันทึก
            </Button>
            <Button onClick={() => form.resetFields()}>ล้างฟอร์ม</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
