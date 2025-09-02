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

export default function Login() {
  const router = useRouter();
  const [form] = useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [remember, setRemember] = useState<boolean>(false);
  const [mode, setMode] = useState<"login" | "forgot">("login"); // เพิ่ม state

  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  // ฟังก์ชัน Login
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
        message.error("Failed to authenticate. Please try again.");
      } else {
        message.success("Login Success");
        router.push("/page");
      }
    });
  };

  // ฟังก์ชันส่งลิงก์รีเซ็ตรหัสผ่าน
  const onForgotFinish = (values: { email: string }) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success(
        `Reset link sent to ${values.email}. Please check your email.`
      );
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
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin />
      </div>
    );
  }

  return (
    <>
      <ConfigProvider>
        <div className="relative h-screen w-screen flex justify-center items-center">
          {/* Background layer */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/login page background.jpg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              filter: "brightness(0.7)",
              backdropFilter: "blur(4px)",
              zIndex: 0,
            }}
          />
          <Card className="max-w-lg w-full rounded-xl shadow-md bg-white bg-opacity-95">
            {mode === "login" && (
              <Form
                form={form}
                initialValues={{ remember: false }}
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
              >
                <div className="flex justify-center m-5 mb-8">
                  {" "}
                  {/* logo */}
                  <img
                    src="/rpst.png"
                    alt="logo-page"
                    className="w-20 md:w-40 h-auto"
                  />
                </div>

                <p className="mt-4 text-center text-lg font-semibold">
                  โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านผาผึ้ง
                </p>

                <Form.Item
                  label="ชื่อผู้ใช้"
                  name="username"
                  rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้!" }]}
                >
                  <Input
                    placeholder="user@gmail.com"
                    onChange={(e) =>
                      setUser((prev) => ({ ...prev, username: e.target.value }))
                    }
                    style={{ borderRadius: 12 }}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="รหัสผ่าน"
                  name="password"
                  rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน!" }]}
                >
                  <Input.Password
                    placeholder="*********"
                    onChange={(e) =>
                      setUser((prev) => ({ ...prev, password: e.target.value }))
                    }
                    style={{ borderRadius: 12 }}
                    size="large"
                  />
                </Form.Item>

                <div className="flex justify-between items-center w-full">
                  <Form.Item
                    name="remember"
                    valuePropName="checked"
                    className="m-0"
                  >
                    <Checkbox onClick={handleRemember}>จดจำรหัสผ่าน</Checkbox>
                  </Form.Item>

                  <Form.Item className="m-0">
                    {/* เปลี่ยนเป็นปุ่มลิงก์ที่เปลี่ยน state */}
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                      style={{
                        outline: "none",
                        border: "none",
                        background: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </Form.Item>
                </div>

                <Form.Item className="mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full py-5 text-lg font-semibold h-6 rounded-lg"
                  >
                    เข้าสู่ระบบ
                  </Button>
                </Form.Item>
              </Form>
            )}

            {mode === "forgot" && (
              <Form layout="vertical" onFinish={onForgotFinish}>
                <h2 className="text-left text-lg font-semibold mb-6">
                  ลืมรหัสผ่าน
                </h2>

                <div className="flex justify-center m-5 mb-8">
                  <img
                    src="/rpst.png"
                    alt="logo-page"
                    className="w-20 md:w-40 h-auto"
                  />
                </div>

                {/* ฟอร์มลืมรหัสผ่าน */}
                <Form.Item
                  label="ชื่อผู้ใช้"
                  name="username"
                  rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้!" }]}
                >
                  <Input
                    placeholder="กรอกชื่อผู้ใช้ของคุณ"
                    style={{ borderRadius: 12 }}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="รหัสผ่านเก่า"
                  name="oldPassword"
                  rules={[
                    { required: true, message: "กรุณากรอกรหัสผ่านเก่า!" },
                  ]}
                >
                  <Input.Password
                    placeholder="กรอกรหัสผ่านเก่า"
                    style={{ borderRadius: 12 }}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="อีเมล"
                  name="email"
                  rules={[
                    { required: true, message: "กรุณากรอกอีเมลของคุณ!" },
                    { type: "email", message: "กรุณากรอกอีเมลให้ถูกต้อง!" },
                  ]}
                >
                  <Input
                    placeholder="กรอกอีเมลของคุณ"
                    style={{ borderRadius: 12 }}
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full py-5 text-lg font-semibold h-6 rounded-lg"
                  >
                    ยืนยัน
                  </Button>
                </Form.Item>

                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-blue-600 flex items-center gap-1 bg-transparent border-none p-0 outline-none cursor-pointer"
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    outline: "none",
                    textDecoration: "none",
                  }}
                >
                  <span
                    className="text-sm relative -top-[6px]"
                    style={{ textDecoration: "none" }}
                  >
                    ←
                  </span>
                  <span className="hover:underline text-sm relative -top-[6px]">
                    กลับไปยังหน้าล็อกอิน
                  </span>
                </button>
              </Form>
            )}
          </Card>
        </div>
      </ConfigProvider>
      <style jsx global>{`
        .ant-card .ant-card-body {
          padding-inline: 14px !important;
          padding-block: 3px !important;           
        }
      `}</style>
    </>
  );
}
