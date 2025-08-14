"use client";

import React from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
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

export default function DurableArticleForm({ setLoading, loading }: Props) {
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
      await intraAuthService.createDurableArticle(payload);
      setLoading(true);
      message.success("บันทึกข้อมูลครุภัณฑ์สำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  return (
    <Card title="ข้อมูลครุภัณฑ์">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          usageLifespanYears: 1,
          unitPrice: 0,
          monthlyDepreciation: 0,
          yearlyDepreciation: 0,
          accumulatedDepreciation: 0,
          netValue: 0,
        }}
      >
        <Form.Item
          label="รหัสครุภัณฑ์"
          name="code"
          rules={[{ required: true, message: "กรุณากรอกรหัสครุภัณฑ์" }]}
        >
          <Input placeholder="เช่น DA-001" />
        </Form.Item>

        <Form.Item
          label="วันที่ได้มา"
          name="acquiredDate"
          rules={[{ required: true, message: "กรุณาเลือกวันที่ได้มา" }]}
        >
          <DatePicker format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          label="รายละเอียด"
          name="description"
          rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="ราคาต่อหน่วย"
          name="unitPrice"
          rules={[{ required: true, message: "กรุณากรอกราคาต่อหน่วย" }]}
        >
          <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="วิธีที่ได้มา"
          name="acquisitionType"
          rules={[{ required: true, message: "กรุณาเลือกวิธีที่ได้มา" }]}
        >
          <Select>
            <Select.Option value="จัดซื้อ">จัดซื้อ</Select.Option>
            <Select.Option value="รับบริจาค">รับบริจาค</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="อายุการใช้งาน (ปี)"
          name="usageLifespanYears"
          rules={[{ required: true, message: "กรุณากรอกอายุการใช้งาน" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="ค่าเสื่อมราคาต่อเดือน"
          name="monthlyDepreciation"
          rules={[
            { required: true, message: "กรุณากรอกค่าเสื่อมราคาต่อเดือน" },
          ]}
        >
          <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="ค่าเสื่อมราคาปีงบประมาณ"
          name="yearlyDepreciation"
          rules={[
            { required: true, message: "กรุณากรอกค่าเสื่อมราคาปีงบประมาณ" },
          ]}
        >
          <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="ค่าเสื่อมราคาสะสม"
          name="accumulatedDepreciation"
          rules={[{ required: true, message: "กรุณากรอกค่าเสื่อมราคาสะสม" }]}
        >
          <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="มูลค่าสุทธิ"
          name="netValue"
          rules={[{ required: true, message: "กรุณากรอกมูลค่าสุทธิ" }]}
        >
          <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="หมายเหตุ" name="note">
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
