"use client";

import React from "react";
import { Form, Input, DatePicker, Button, Row, Col, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { visitHomeServices } from "../services/visitHome.service";
import dayjs from "dayjs";

export default function VisitHomeForm() {
  const [form] = Form.useForm();

  const intraAuth = useAxiosAuth();
  const intraAuthService = visitHomeServices(intraAuth);

  const handleFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        age: Number(values.age),
        visitDate: values.visitDate
          ? dayjs(values.visitDate).toISOString()
          : null,
        nextAppointment: values.nextAppointment
          ? dayjs(values.nextAppointment).toISOString()
          : null,
        symptoms: values.symptoms || null,
        medication: values.medication || null,
        notes: values.notes || null,
      };

      await intraAuthService.createVisitHomeWaste(payload);

      message.success("บันทึกข้อมูลสำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleFinish}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="firstName" label="ชื่อ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="lastName"
            label="นามสกุล"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="age" label="อายุ" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item
            name="address"
            label="ที่อยู่"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="visitDate"
            label="วันที่เยี่ยมบ้าน"
            rules={[{ required: true }]}
          >
            <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="nextAppointment" label="นัดครั้งถัดไป">
            <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="symptoms" label="อาการ">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="medication" label="การใช้ยา">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="notes" label="หมายเหตุ">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          บันทึก
        </Button>
      </Form.Item>
    </Form>
  );
}
