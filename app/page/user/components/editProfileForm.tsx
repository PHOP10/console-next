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
  ConfigProvider,
} from "antd";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import th_TH from "antd/locale/th_TH"; // เพิ่ม locale ภาษาไทย
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../services/user.service";
import { UserType } from "../../common";

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
        // startDate และ fields ที่ disabled จะไม่ถูกส่งไปถ้าไม่ได้อยู่ใน values
        // แต่จริงๆ user update API มักจะไม่ให้แก้ employeeId/startDate อยู่แล้ว
      };

      await intraAuthService.updateUser(body);
      message.success("อัปเดตข้อมูลโปรไฟล์สำเร็จ");
      onSuccess();
    } catch (error) {
      console.error(error);
      message.error("อัปเดตข้อมูลไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Style Constants (เพื่อให้สวยเหมือนหน้าอื่นๆ) ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const disabledInputStyle =
    "w-full h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed shadow-inner";

  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  return (
    <ConfigProvider locale={th_TH}>
      <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="ชื่อผู้ใช้" name="username">
              <Input className={inputStyle} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="เพศ" name="gender">
              <Select className={selectStyle}>
                <Select.Option value="male">นาย</Select.Option>
                <Select.Option value="female">นาง</Select.Option>
                <Select.Option value="miss">นางสาว</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ชื่อจริง"
              name="firstName"
              rules={[{ required: true, message: "กรุณาระบุชื่อจริง" }]}
            >
              <Input placeholder="ชื่อจริง" className={inputStyle} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="นามสกุล"
              name="lastName"
              rules={[{ required: true, message: "กรุณาระบุนามสกุล" }]}
            >
              <Input placeholder="นามสกุล" className={inputStyle} />
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
              <Input placeholder="example@email.com" className={inputStyle} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="เบอร์โทรศัพท์"
              name="phoneNumber"
              rules={[
                {
                  pattern: /^[0-9]{10}$/,
                  message: "กรุณากรอกเบอร์โทร 10 หลัก",
                },
              ]}
            >
              <Input
                placeholder="0xxxxxxxxx"
                className={inputStyle}
                maxLength={10}
                inputMode="numeric"
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider
          orientation="left"
          style={{ borderColor: "#e5e7eb", color: "#0683e9" }}
        >
          ข้อมูลการทำงาน
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="รหัสพนักงาน" name="employeeId">
              <Input disabled className={disabledInputStyle} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="ตำแหน่ง" name="position">
              <Input disabled className={disabledInputStyle} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="วันที่เริ่มงาน" name="startDate">
              <DatePicker
                disabled
                style={{ width: "100%" }}
                className={disabledInputStyle}
                format={(value) =>
                  value
                    ? `${value.format("DD  MMMM")}  ${value.year() + 543}`
                    : ""
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <div
          style={{
            textAlign: "right",
            marginTop: 24,
            borderTop: "1px solid #f0f0f0",
            paddingTop: "16px",
          }}
        >
          <Button
            onClick={onCancel}
            style={{ marginRight: 12, borderRadius: "8px", height: "40px" }}
            icon={<CloseOutlined />}
          >
            ยกเลิก
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            style={{
              borderRadius: "8px",
              height: "40px",
              backgroundColor: "#0683e9",
              paddingLeft: "24px",
              paddingRight: "24px",
            }}
            icon={<SaveOutlined />}
          >
            บันทึกข้อมูล
          </Button>
        </div>
      </Form>
    </ConfigProvider>
  );
}
