"use client";

import { useState } from "react";
import { Form, Input, Button, message, Steps } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  NumberOutlined,
  SafetyCertificateOutlined,
  MobileOutlined,
} from "@ant-design/icons";

// 1. ลบ useAxiosAuth ออก เพราะเรายังไม่มี Token
// import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";

// 2. Import axios จากไฟล์ Config ของคุณ (ตัวที่เป็น Public)
// สมมติว่าไฟล์นี้ export default instance ออกมา
import axiosPublic from "@/app/lib/axios/axios";
import { indexService } from "../../services/indexServices";

type ForgotFormProps = {
  onFinish?: (values: any) => void;
  onBackToLogin: () => void;
  inputStyle: React.CSSProperties;
  buttonStyle: React.CSSProperties;
};

export default function ForgotForm({
  onBackToLogin,
  inputStyle,
  buttonStyle,
}: ForgotFormProps) {
  const intraAuthService = indexService(axiosPublic);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [tempData, setTempData] = useState({
    username: "",
    resetToken: "", // เก็บ Token ที่ได้หลังจาก Verify OTP ผ่าน
  });
  const [form] = Form.useForm();

  const handleRequestOtp = async (values: any) => {
    setLoading(true);
    try {
      // เรียก Service หน้าบ้าน (ตอนนี้เป็น Mock)
      await intraAuthService.requestOtp({
        username: values.username,
        contact: values.email,
      });

      message.success("รหัส OTP ถูกส่งไปยังช่องทางที่คุณเลือกแล้ว");
      setTempData({ ...tempData, username: values.username });
      setCurrentStep(2);
    } catch (error) {
      message.error("ไม่พบข้อมูลผู้ใช้ หรือระบบขัดข้อง");
    } finally {
      setLoading(false);
    }
  };

  // --- Logic Step 2: Verify OTP ---
  const handleVerifyOtp = async (values: any) => {
    setLoading(true);
    try {
      const res: any = await intraAuthService.verifyOtp({
        username: tempData.username,
        otp: values.otp,
      });

      // สมมติว่า Verify ผ่านจะได้ resetToken กลับมา
      message.success("ยืนยันตัวตนสำเร็จ กรุณาตั้งรหัสผ่านใหม่");
      setTempData({ ...tempData, resetToken: res.resetToken });
      setCurrentStep(3); // ไปหน้าตั้งรหัสผ่านใหม่
    } catch (error) {
      message.error("รหัส OTP ไม่ถูกต้อง หรือหมดอายุ");
    } finally {
      setLoading(false);
    }
  };

  // --- Logic Step 3: Reset Password ---
  const handleResetPassword = async (values: any) => {
    setLoading(true);
    try {
      await intraAuthService.resetPassword({
        newPassword: values.newPassword,
        resetToken: tempData.resetToken,
      });

      message.success("เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบใหม่");
      onBackToLogin(); // เด้งกลับหน้า Login
    } catch (error) {
      message.error("ไม่สามารถเปลี่ยนรหัสผ่านได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header (แสดงเหมือนเดิมตลอด) */}
      <div className="flex flex-col items-center mb-6">
        <img
          src="/rpst.png"
          alt="logo-page"
          className="w-16 h-auto mb-3 opacity-80"
        />
        <h2 className="text-xl font-bold text-gray-800">
          {currentStep === 1 && "ลืมรหัสผ่าน"}
          {currentStep === 2 && "ยืนยันตัวตน"}
          {currentStep === 3 && "ตั้งรหัสผ่านใหม่"}
        </h2>
        <p className="text-gray-500 text-sm text-center px-4">
          {currentStep === 1 && "กรอกข้อมูลเพื่อค้นหาบัญชีของคุณ"}
          {currentStep === 2 && "กรอกรหัส OTP 6 หลักที่ได้รับ"}
          {currentStep === 3 && "กำหนดรหัสผ่านใหม่เพื่อเข้าใช้งาน"}
        </p>
      </div>

      {/* --- Step 1: Form กรอก Username & Email/Phone --- */}
      {currentStep === 1 && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRequestOtp}
          requiredMark={false}
        >
          <Form.Item
            label={
              <span className="font-medium text-gray-600">ชื่อผู้ใช้</span>
            }
            name="username"
            rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้!" }]}
            className="mb-4"
          >
            <Input
              placeholder="Username"
              prefix={<UserOutlined className="text-gray-400 mr-2" />}
              size="large"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-600">อีเมล</span>}
            name="email"
            rules={[
              { required: true, message: "กรุณากรอกอีเมล หรือเบอร์โทร!" },
            ]}
            className="mb-8"
          >
            <Input
              placeholder="Email"
              prefix={<MailOutlined className="text-gray-400 mr-2" />}
              size="large"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              block
              style={buttonStyle}
              loading={loading}
              className="bg-blue-600 hover:bg-blue-500 border-none"
            >
              ส่งรหัสยืนยัน (OTP)
            </Button>
          </Form.Item>
        </Form>
      )}

      {/* --- Step 2: Form กรอก OTP --- */}
      {currentStep === 2 && (
        <Form layout="vertical" onFinish={handleVerifyOtp} requiredMark={false}>
          <div className="text-center mb-4 text-blue-600 font-medium">
            Username: {tempData.username}
          </div>

          <Form.Item
            label={<span className="font-medium text-gray-600">รหัส OTP</span>}
            name="otp"
            rules={[
              { required: true, message: "กรุณากรอกรหัส OTP!" },
              { len: 6, message: "รหัส OTP ต้องมี 6 หลัก" },
            ]}
            className="mb-8"
          >
            <Input
              placeholder="XXXXXX"
              prefix={
                <SafetyCertificateOutlined className="text-gray-400 mr-2" />
              }
              size="large"
              maxLength={6}
              style={{
                ...inputStyle,
                textAlign: "center",
                letterSpacing: "4px",
              }}
            />
          </Form.Item>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              block
              style={buttonStyle}
              loading={loading}
              className="bg-blue-600 hover:bg-blue-500 border-none"
            >
              ยืนยันรหัส OTP
            </Button>
          </Form.Item>

          <div className="text-center mt-2">
            <Button
              type="link"
              onClick={() => setCurrentStep(1)}
              disabled={loading}
            >
              ส่ง OTP ใหม่อีกครั้ง
            </Button>
          </div>
        </Form>
      )}

      {/* --- Step 3: Form กรอกรหัสใหม่ --- */}
      {currentStep === 3 && (
        <Form
          layout="vertical"
          onFinish={handleResetPassword}
          requiredMark={false}
        >
          <Form.Item
            label={
              <span className="font-medium text-gray-600">รหัสผ่านใหม่</span>
            }
            name="newPassword"
            rules={[
              { required: true, message: "กรุณากรอกรหัสผ่านใหม่!" },
              { min: 6, message: "รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร" },
            ]}
            className="mb-4"
          >
            <Input.Password
              placeholder="New Password"
              prefix={<LockOutlined className="text-gray-400 mr-2" />}
              size="large"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="font-medium text-gray-600">
                ยืนยันรหัสผ่านใหม่
              </span>
            }
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "กรุณายืนยันรหัสผ่านใหม่!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("รหัสผ่านไม่ตรงกัน!"));
                },
              }),
            ]}
            className="mb-8"
          >
            <Input.Password
              placeholder="Confirm New Password"
              prefix={<LockOutlined className="text-gray-400 mr-2" />}
              size="large"
              style={inputStyle}
            />
          </Form.Item>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              block
              style={buttonStyle}
              loading={loading}
              className="bg-blue-600 hover:bg-blue-500 border-none"
            >
              เปลี่ยนรหัสผ่าน
            </Button>
          </Form.Item>
        </Form>
      )}

      {/* ปุ่มกลับหน้า Login (แสดงทุก Step หรือเฉพาะ Step 1 แล้วแต่ดีไซน์ แต่ใส่ไว้ให้ใช้ง่าย) */}
      <div className="text-center mt-2">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBackToLogin}
          className="text-gray-500 hover:text-blue-600 transition-colors"
          disabled={loading}
        >
          กลับไปยังหน้าเข้าสู่ระบบ
        </Button>
      </div>
    </div>
  );
}
