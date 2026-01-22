"use client";

import {
  Form,
  Checkbox,
  Button,
  Input,
  Card,
  Spin,
  ConfigProvider,
  message,
} from "antd";
import { useForm } from "antd/es/form/Form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  LoginOutlined,
} from "@ant-design/icons"; 

/* import "../components/Navigation/font.css";  */


export default function Login() {
  const router = useRouter();
  const [form] = useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [remember, setRemember] = useState<boolean>(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");

  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  const onFinish = () => {
    if (remember) {
      if (!localStorage.getItem("username")) {
        localStorage.setItem("username", user.username);
      }
      if (!localStorage.getItem("password")) {
        localStorage.setItem("password", user.password);
      }
    }
    form.validateFields().then(async (values) => {
      const result = await signIn("username-login", {
        username: values.username,
        password: values.password,
        redirect: false,
      });
      if (result?.error) {
        message.error("ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง");
      } else {
        message.success("เข้าสู่ระบบสำเร็จ");
        router.push("/page");
      }
    });
  };

  const onForgotFinish = (values: { email: string }) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success(
        `ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปยัง ${values.email} แล้ว กรุณาตรวจสอบอีเมล`
      );
      setMode("login"); // ส่งเสร็จให้กลับมาหน้า Login
    }, 1500);
  };

  const handleRemember = (event: any) => {
    setRemember(event.target.checked);
    localStorage.setItem("remember", event.target.checked);
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    const remember = localStorage.getItem("remember");
    if (remember === "true") {
      setRemember(true);
      const getUsername = localStorage.getItem("username") || "";
      const getPassword = localStorage.getItem("password") || "";
      form.setFieldsValue({
        username: getUsername,
        password: getPassword,
        remember: true,
      });
      setUser({ username: getUsername, password: getPassword });
    }
  }, [form]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  const glassCardStyle = {
    background: "rgba(255, 255, 255, 0.75)", 
    backdropFilter: "blur(16px)", 
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: "24px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)", 
    border: "1px solid rgba(255, 255, 255, 0.4)",
    overflow: "hidden",
  };

  // สไตล์ช่องกรอกข้อมูล
  const inputStyle = {
    borderRadius: "12px",
    padding: "10px 12px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  };

  // สไตล์ปุ่มกด
  const buttonStyle = {
    height: "48px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
  };

  return (
    <ConfigProvider>
      <div className="relative min-h-screen w-full flex justify-center items-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 transform scale-105"
          style={{
            backgroundImage: 'url("/login page background.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "brightness(0.65) blur(3px)",
          }}
        />

        <Card
          className="w-full max-w-[440px] mx-4 relative z-10"
          bordered={false}
          style={glassCardStyle}
          bodyStyle={{ padding: "40px 32px" }} 
        >
          {mode === "login" ? (
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
                    setUser((prev) => ({ ...prev, username: e.target.value }))
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
                    setUser((prev) => ({ ...prev, password: e.target.value }))
                  }
                />
              </Form.Item>

              {/* Remember Me & Forgot Password */}
              <div className="flex justify-between items-center mb-6">
                <Form.Item
                  name="remember"
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox
                    onClick={handleRemember}
                    className="text-gray-600"
                  >
                    จดจำรหัสผ่าน
                  </Checkbox>
                </Form.Item>

                <Button
                  type="link"
                  onClick={() => setMode("forgot")}
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
          ) : (
            // ================== FORGOT PASSWORD FORM ==================
            <Form layout="vertical" onFinish={onForgotFinish} requiredMark={false}>
              {/* Header */}
              <div className="flex flex-col items-center mb-6">
                <img
                  src="/rpst.png"
                  alt="logo-page"
                  className="w-16 h-auto mb-3 opacity-80"
                />
                <h2 className="text-xl font-bold text-gray-800">ลืมรหัสผ่าน</h2>
                <p className="text-gray-500 text-sm text-center px-4">
                  กรอกข้อมูลเพื่อยืนยันตัวตนและรีเซ็ตรหัสผ่าน
                </p>
              </div>

              {/* Username Input */}
              <Form.Item
                label={<span className="font-medium text-gray-600">ชื่อผู้ใช้</span>}
                name="username"
                rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้!" }]}
                className="mb-4"
              >
                <Input
                  placeholder="ชื่อผู้ใช้ของคุณ"
                  prefix={<UserOutlined className="text-gray-400 mr-2" />}
                  size="large"
                  style={inputStyle}
                />
              </Form.Item>

              {/* Old Password Input */}
              <Form.Item
                label={<span className="font-medium text-gray-600">รหัสผ่านเก่า</span>}
                name="oldPassword"
                rules={[{ required: true, message: "กรุณากรอกรหัสผ่านเก่า!" }]}
                className="mb-4"
              >
                <Input.Password
                  placeholder="กรอกรหัสผ่านเก่า"
                  prefix={<LockOutlined className="text-gray-400 mr-2" />}
                  size="large"
                  style={inputStyle}
                />
              </Form.Item>

              {/* Email Input */}
              <Form.Item
                label={<span className="font-medium text-gray-600">อีเมล</span>}
                name="email"
                rules={[
                  { required: true, message: "กรุณากรอกอีเมล!" },
                  { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง!" },
                ]}
                className="mb-8"
              >
                <Input
                  placeholder="example@email.com"
                  prefix={<MailOutlined className="text-gray-400 mr-2" />}
                  size="large"
                  style={inputStyle}
                />
              </Form.Item>

              {/* Confirm Button */}
              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  style={buttonStyle}
                  className="bg-blue-600 hover:bg-blue-500 border-none"
                >
                  ยืนยันข้อมูล
                </Button>
              </Form.Item>

              {/* Back to Login Button */}
              <div className="text-center">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setMode("login")}
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                >
                  กลับไปยังหน้าเข้าสู่ระบบ
                </Button>
              </div>
            </Form>
          )}
        </Card>
      </div>
    </ConfigProvider>
  );
}