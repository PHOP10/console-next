"use client";

import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  DatePicker,
  Divider,
  message,
} from "antd";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../services/user.service"; // ปรับ path ตามจริง
import { UserType } from "../../common"; // ปรับ path ตามจริง

interface EditProfileFormProps {
  userData: UserType;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function EditProfileForm({
  userData,
  onCancel,
  onSuccess,
}: EditProfileFormProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);

  // Set ค่าเริ่มต้นเมื่อ Component โหลด
  useEffect(() => {
    if (userData) {
      form.setFieldsValue({
        ...userData,
        startDate: userData.startDate ? dayjs(userData.startDate) : null,
      });
    }
  }, [userData, form]);

  const handleUpdateProfile = async (values: any) => {
    setSubmitting(true);
    try {
      const body = {
        ...values,
        userId: userData.userId,
        startDate: values.startDate ? values.startDate.toISOString() : null,
      };

      await intraAuthService.updateUser(body);
      message.success("อัปเดตข้อมูลโปรไฟล์สำเร็จ");
      onSuccess(); // แจ้ง Parent ว่าเสร็จแล้ว
    } catch (error) {
      console.error(error);
      message.error("อัปเดตข้อมูลไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleUpdateProfile}
      initialValues={{ gender: "other" }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="ชื่อจริง"
            name="firstName"
            rules={[{ required: true, message: "กรุณาระบุชื่อจริง" }]}
          >
            <Input placeholder="ชื่อจริง" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="นามสกุล"
            name="lastName"
            rules={[{ required: true, message: "กรุณาระบุนามสกุล" }]}
          >
            <Input placeholder="นามสกุล" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="ชื่อเล่น" name="nickName">
            <Input placeholder="ชื่อเล่น" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="เพศ" name="gender">
            <Select>
              <Select.Option value="male">ชาย</Select.Option>
              <Select.Option value="female">หญิง</Select.Option>
              <Select.Option value="other">อื่นๆ</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="อีเมล"
            name="email"
            rules={[
              { required: true, message: "กรุณาระบุอีเมล" },
              { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
            ]}
          >
            <Input placeholder="example@email.com" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="เบอร์โทรศัพท์" name="phoneNumber">
            <Input placeholder="08x-xxx-xxxx" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">ข้อมูลการทำงาน</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="รหัสพนักงาน" name="employeeId">
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="ตำแหน่ง" name="position">
            <Input disabled />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="วันที่เริ่มงาน" name="startDate">
            <DatePicker
              disabled
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
            />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ textAlign: "right", marginTop: 20 }}>
        <Button
          onClick={onCancel}
          style={{ marginRight: 8 }}
          icon={<CloseOutlined />}
        >
          ยกเลิก
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={submitting}
          icon={<SaveOutlined />}
        >
          บันทึกข้อมูล
        </Button>
      </div>
    </Form>
  );
}
