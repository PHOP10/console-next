"use client";

import React, { useState } from "react";
import { Form, Input, Button, Row, Col, message } from "antd";
import { LockOutlined, KeyOutlined } from "@ant-design/icons";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../services/user.service";

interface ChangePasswordFormProps {
  userId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ChangePasswordForm({
  userId,
  onCancel,
  onSuccess,
}: ChangePasswordFormProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);

  const handleChangePassword = async (values: any) => {
    setSubmitting(true);
    try {
      const body = {
        userId: userId,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      };

      const res = await intraAuthService.changePassword(body);

      if (res?.status === 400) {
        message.error("รหัสผ่านเดิมไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
        setSubmitting(false);
        return;
      }

      message.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error("Change password error:", error);

      if (error?.response?.status === 404) {
        message.error("ไม่พบข้อมูลผู้ใช้งาน");
      } else {
        message.error("เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Form Validation Failed:", errorInfo);
    message.warning("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleChangePassword}
      onFinishFailed={onFinishFailed}
    >
      <Row gutter={[16, 16]}>
        {/* รหัสผ่านเดิม: เต็มจอเสมอ */}
        <Col span={24}>
          <Form.Item
            label="รหัสผ่านเดิม"
            name="oldPassword"
            rules={[{ required: true, message: "กรุณาระบุรหัสผ่านเดิม" }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
        </Col>

        {/* รหัสผ่านใหม่: มือถือเต็มจอ (24) / จอใหญ่แบ่งครึ่ง (12) */}
        <Col xs={24} sm={12}>
          <Form.Item
            label="รหัสผ่านใหม่"
            name="newPassword"
            rules={[
              { required: true, message: "กรุณาระบุรหัสผ่านใหม่" },
              { min: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
            ]}
          >
            <Input.Password prefix={<KeyOutlined />} />
          </Form.Item>
        </Col>

        {/* ยืนยันรหัสผ่าน: มือถือเต็มจอ (24) / จอใหญ่แบ่งครึ่ง (12) */}
        <Col xs={24} sm={12}>
          <Form.Item
            label="ยืนยันรหัสผ่านใหม่"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "กรุณายืนยันรหัสผ่านใหม่" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("รหัสผ่านไม่ตรงกัน"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<KeyOutlined />} />
          </Form.Item>
        </Col>
      </Row>

      {/* ปรับส่วนปุ่มให้ใช้ Flexbox เพื่อการจัดเรียงที่ดีขึ้นบนมือถือ */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
          marginTop: 20,
        }}
      >
        <Button onClick={onCancel}>ยกเลิก</Button>
        <Button type="primary" htmlType="submit" loading={submitting}>
          ยืนยัน
        </Button>
      </div>
    </Form>
  );
}
