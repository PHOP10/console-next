"use client";

import React, { useState } from "react";
import { Form, Input, Button, Row, Col, Divider, message } from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  LockOutlined,
  KeyOutlined,
} from "@ant-design/icons";
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
    // console.log("Values:", values);

    setSubmitting(true);
    try {
      const body = {
        userId: userId,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      };

      // เรียก API (จะไม่ error แดงแล้ว เพราะเราดัก validateStatus ไว้)
      const res = await intraAuthService.changePassword(body);

      // --- [จุดสำคัญ] เช็คค่าที่ส่งกลับมา ---
      if (res?.status === 400) {
        // ถ้า Backend บอกว่า 400 (รหัสผิด) ให้แจ้งเตือนและจบการทำงาน
        message.error("รหัสผ่านเดิมไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
        setSubmitting(false);
        return;
      }

      // ถ้าผ่าน (ไม่มี error)
      message.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error("Change password error:", error);

      // catch นี้จะทำงานเฉพาะ error ร้ายแรง (404, 500, เน็ตหลุด)
      if (error?.response?.status === 404) {
        message.error("ไม่พบข้อมูลผู้ใช้งาน");
      } else {
        message.error("เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 2. เพิ่มฟังก์ชันเช็คกรณี Validation ไม่ผ่าน
  const onFinishFailed = (errorInfo: any) => {
    console.log("Form Validation Failed (ติดแดง):", errorInfo);
    message.warning("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleChangePassword}
      onFinishFailed={onFinishFailed} // <--- เพิ่มบรรทัดนี้เพื่อเช็ค error
    >
      <Row gutter={[16, 16]}>
        {/* ... (Code ส่วน Input เหมือนเดิม) ... */}

        <Col span={24}>
          <Form.Item
            label="รหัสผ่านเดิม"
            name="oldPassword"
            rules={[{ required: true, message: "กรุณาระบุรหัสผ่านเดิม" }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
        </Col>

        <Col span={12}>
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

        <Col span={12}>
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

      <div style={{ textAlign: "right", marginTop: 20 }}>
        {/* ... ปุ่มเหมือนเดิม ... */}
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          ยกเลิก
        </Button>
        <Button type="primary" htmlType="submit" loading={submitting}>
          ยืนยัน
        </Button>
      </div>
    </Form>
  );
}
