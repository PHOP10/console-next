"use client";

import { Card, Spin, ConfigProvider, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Import components ที่เราแยกไว้
// ตรวจสอบ path ให้ถูกต้องตามตำแหน่งที่คุณวางไฟล์
import LoginForm from "./components/loginForm";
import ForgotForm from "./components/forgotForm";

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

  // --- Logic เดิมทั้งหมด ---
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
        `ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปยัง ${values.email} แล้ว กรุณาตรวจสอบอีเมล`,
      );
      setMode("login");
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

  // --- UI เดิมทั้งหมด ---
  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-screen"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: `
                      radial-gradient(at 40% 20%, hsla(152, 100%, 90%, 1) 0px, transparent 50%),
                      radial-gradient(at 80% 0%, hsla(189, 100%, 90%, 1) 0px, transparent 50%),
                      radial-gradient(at 0% 50%, hsla(120, 100%, 93%, 1) 0px, transparent 50%),
                      radial-gradient(at 80% 50%, hsla(210, 100%, 92%, 1) 0px, transparent 50%),
                      radial-gradient(at 0% 100%, hsla(170, 100%, 88%, 1) 0px, transparent 50%),
                      radial-gradient(at 80% 100%, hsla(200, 100%, 92%, 1) 0px, transparent 50%),
                      radial-gradient(at 0% 0%, hsla(190, 100%, 95%, 1) 0px, transparent 50%)
                  `,
          backgroundSize: "100% 100%",
        }}
      >
        <Spin />
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
  const inputStyle = {
    borderRadius: "12px",
    padding: "10px 12px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  };

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
            <LoginForm
              form={form}
              onFinish={onFinish}
              setUser={setUser}
              handleRemember={handleRemember}
              onGoToForgot={() => setMode("forgot")}
              inputStyle={inputStyle}
              buttonStyle={buttonStyle}
            />
          ) : (
            <ForgotForm
              onFinish={onForgotFinish}
              onBackToLogin={() => setMode("login")}
              inputStyle={inputStyle}
              buttonStyle={buttonStyle}
            />
          )}
        </Card>
      </div>
    </ConfigProvider>
  );
}
