"use client";

import { Card, Spin, ConfigProvider, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoginForm from "./components/loginForm";
import ForgotForm from "./components/forgotForm";
import axios from "axios";

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

  // const onFinish = () => {
  //   if (remember) {
  //     if (!localStorage.getItem("username")) {
  //       localStorage.setItem("username", user.username);
  //     }
  //     if (!localStorage.getItem("password")) {
  //       localStorage.setItem("password", user.password);
  //     }
  //   }
  //   form.validateFields().then(async (values) => {
  //     const result = await signIn("username-login", {
  //       username: values.username,
  //       password: values.password,
  //       redirect: false,
  //     });
  //     if (result?.error) {
  //       // ✅ ต้องเช็คที่ "ข้อความ" (String) แทนครับ
  //       const errorText = result.error;
  //       console.log("ข้อความที่ได้จากหลังบ้าน:", errorText);

  //       // เช็คข้อความภาษาไทยที่เราส่งมาจาก Backend
  //       if (errorText.includes("ไม่มีชื่อผู้ใช้งานนี้ในระบบ")) {
  //         message.error(errorText); // "ไม่พบชื่อผู้ใช้งานนี้ในระบบ"
  //       } else if (errorText.includes("รหัสผ่านไม่ถูกต้อง")) {
  //         message.error(errorText); // "รหัสผ่านไม่ถูกต้อง..."
  //       }
  //       // กรณีโดน NextAuth บัง (Production)
  //       else if (errorText.includes("CredentialsSignin")) {
  //         message.error("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง");
  //       } else {
  //         message.error(errorText);
  //       }
  //     } else {
  //       message.success("เข้าสู่ระบบสำเร็จ");
  //       router.push("/page");
  //     }
  //   });
  // };

  const onFinish = () => {
    form.validateFields().then(async (values) => {
      // -------------------------------------------------------
      // 🚀 วิธีใหม่: ยิง Login ของจริงก่อนเลย (เพื่อความเร็ว!)
      // -------------------------------------------------------
      const result = await signIn("username-login", {
        username: values.username,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        // ❌ ถ้า Login ไม่ผ่าน: เราค่อยมายิง Gateway เพื่อหา "สาเหตุ" ภาษาไทย
        console.log("Login failed, checking reason with Gateway...");

        try {
          await axios.post("/gateway/login", {
            username: values.username,
            password: values.password,
          });

          // (ในทางทฤษฎี ถ้า signIn พลาด Gateway ก็ควร Error ด้วย)
          // แต่ถ้า Gateway ดันผ่าน (แปลกมาก) ก็ให้แจ้ง Error กลางๆ
          message.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        } catch (err: any) {
          // ✅ นี่คือสิ่งที่เราต้องการ: ข้อความภาษาไทยจาก Gateway
          const msg =
            err.response?.data?.message ||
            "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง";
          message.error(msg);
        }
      } else {
        // ✅ ถ้า Login ผ่าน: ไปต่อได้เลย! (ไม่ต้องเสียเวลาเช็ค Gateway)
        message.success("เข้าสู่ระบบสำเร็จ");

        if (remember) {
          localStorage.setItem("username", values.username);
          localStorage.setItem("password", values.password);
          localStorage.setItem("remember", "true");
        } else {
          localStorage.removeItem("username");
          localStorage.removeItem("password");
          localStorage.removeItem("remember");
        }

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
