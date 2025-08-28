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
  Row,
  Col,
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
    console.log(values);
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
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="รหัสครุภัณฑ์"
              name="code"
              rules={[
                { required: true, message: "กรุณากรอกรหัสครุภัณฑ์" },
                {
                  pattern: /^[0-9/-]+$/,
                  message: "กรุณากรอกเฉพาะตัวเลข, /, - และต้องมี 13 ตัวอักษร",
                },
              ]}
            >
              <Input placeholder="เช่น xxxx-xxx-xxxx" maxLength={15} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="วันที่ได้มา"
              name="acquiredDate"
              rules={[{ required: true, message: "กรุณาเลือกวันที่ได้มา" }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ"
          name="description"
          rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ราคาต่อหน่วย"
              name="unitPrice"
              rules={[{ required: true, message: "กรุณากรอกราคาต่อหน่วย" }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="วิธีที่ได้มา"
              name="acquisitionType"
              rules={[{ required: true, message: "กรุณาเลือกวิธีที่ได้มา" }]}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="อายุการใช้งาน (ปี)"
              name="usageLifespanYears"
              rules={[{ required: true, message: "กรุณากรอกอายุการใช้งาน" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="ค่าเสื่อมราคาต่อเดือน"
              name="monthlyDepreciation"
              rules={[
                { required: true, message: "กรุณากรอกค่าเสื่อมราคาต่อเดือน" },
              ]}
            >
              <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="หมายเหตุ" name="note">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              บันทึก
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
