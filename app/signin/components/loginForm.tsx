"use client";

import { Form, Input, Checkbox, Button } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";

type LoginFormProps = {
  form: any;
  onFinish: () => void;
  setUser: any;
  handleRemember: (e: any) => void;
  onGoToForgot: () => void;
  inputStyle: React.CSSProperties;
  buttonStyle: React.CSSProperties;
};

export default function LoginForm({
  form,
  onFinish,
  setUser,
  handleRemember,
  onGoToForgot,
  inputStyle,
  buttonStyle,
}: LoginFormProps) {
  return (
    <Form
      form={form}
      initialValues={{ remember: false }}
      onFinish={onFinish}
      autoComplete="off"
      layout="vertical"
      requiredMark={false}
    >
      <div className="flex flex-col items-center mb-8">
        <img
          src="/rpst.png"
          alt="logo-page"
          className="w-24 h-auto mb-4 drop-shadow-md transition-transform hover:scale-105 duration-300"
        />
        <h2 className="text-center text-xl md:text-2xl font-bold text-gray-800 leading-tight">
          โรงพยาบาลส่งเสริมสุขภาพ
          <br />
          ตำบลบ้านผาผึ้ง
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
        </p>
      </div>
      <Form.Item
        label={<span className="font-medium text-gray-600">ชื่อผู้ใช้</span>}
        name="username"
        rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้!" }]}
        className="mb-5"
      >
        <Input
          placeholder="กรอกชื่อผู้ใช้"
          prefix={<UserOutlined className="text-gray-400 mr-2" />}
          size="large"
          style={inputStyle}
          onChange={(e) =>
            setUser((prev: any) => ({ ...prev, username: e.target.value }))
          }
        />
      </Form.Item>

      {/* Password Input */}
      <Form.Item
        label={<span className="font-medium text-gray-600">รหัสผ่าน</span>}
        name="password"
        rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน!" }]}
        className="mb-5"
      >
        <Input.Password
          placeholder="กรอกรหัสผ่าน"
          prefix={<LockOutlined className="text-gray-400 mr-2" />}
          size="large"
          style={inputStyle}
          onChange={(e) =>
            setUser((prev: any) => ({ ...prev, password: e.target.value }))
          }
        />
      </Form.Item>
      <div className="flex justify-between items-center mb-6">
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox onClick={handleRemember} className="text-gray-600">
            จดจำรหัสผ่าน
          </Checkbox>
        </Form.Item>

        <Button
          type="link"
          onClick={onGoToForgot}
          className="p-0 text-blue-600 hover:text-blue-700 font-medium h-auto"
        >
          ลืมรหัสผ่าน?
        </Button>
      </div>

      {/* Submit Button */}
      <Form.Item className="mb-2">
        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<LoginOutlined />}
          style={buttonStyle}
          className="bg-blue-600 hover:bg-blue-500 border-none transition-all duration-300 transform hover:-translate-y-0.5"
        >
          เข้าสู่ระบบ
        </Button>
      </Form.Item>
    </Form>
  );
}
