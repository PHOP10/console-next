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

interface IUserLogin {
  username: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const [form] = useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [remember, setRemember] = useState<boolean>(false);

  const [user, setUser] = useState<IUserLogin>({
    username: "",
    password: "",
  });

  const onFinish = () => {
    if (remember) {
      const getUsername = localStorage.getItem("username") as string;
      const getPassword = localStorage.getItem("password") as string;
      if (!getUsername) {
        localStorage.setItem("username", user.username);
      }
      if (!getPassword) {
        localStorage.setItem("password", user.password);
      }
    }
    form.validateFields().then(async (values) => {
      const result = await signIn("username-login", {
        username: values.username,
        password: values.password,
        redirect: false,
        // callbackUrl: "/page",
      });
      if (result?.error) {
        message.error("Failed to authenticate. Please try again.");
      } else {
        // Manually redirect user after successful login
        message.success("Login Success");
        router.push("/page"); // Redirect to the dashboard or any page
      }
    });
  };

  type FieldType = {
    username?: string;
    password?: string;
    remember?: string;
  };

  const handleRemember = (event: any) => {
    setRemember(event.target.checked);
    localStorage.setItem("remember", event.target.checked);
  };

  const setUserFromLocalStorage = () => {
    setUser({
      username: localStorage.getItem("username") ?? "",
      password: localStorage.getItem("password") ?? "",
    });
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    setUserFromLocalStorage();
  }, []);

  useEffect(() => {
    const remember = localStorage.getItem("remember");
    if (remember === "true") {
      setRemember(true);
      const getUsername = localStorage.getItem("username") as string;
      const getPassword = localStorage.getItem("password") as string;
      form.setFieldsValue({
        username: getUsername,
        password: getPassword,
        remember: true,
      });
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
        <div className="flex justify-center items-center h-screen w-full bg-cyan-100">
          <Card className="p-5">
            <Form
              form={form}
              initialValues={{ remember: false }}
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
            >
              <div className="flex justify-center m-5 mb-8">
                <img
                  src="/rpst.png"
                  alt="logo-page"
                  className={`w-20 md:w-40 h-auto`}
                />
              </div>
              <Form.Item<FieldType>
                label="Username"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please input your username!",
                  },
                ]}
              >
                <Input
                  style={{ width: "100%" }}
                  onChange={(event) =>
                    setUser((prev: any) => ({
                      ...prev,
                      username: event.target.value,
                    }))
                  }
                />
              </Form.Item>

              <Form.Item<FieldType>
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
              >
                <Input.Password
                  onChange={(event) =>
                    setUser((prev: any) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                />
              </Form.Item>

              <Form.Item<FieldType> name="remember" valuePropName="checked">
                <Checkbox onClick={handleRemember}>Remember me</Checkbox>
              </Form.Item>

              <Form.Item className="flex justify-center">
                <Button type="primary" htmlType="submit">
                  Sign In
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </ConfigProvider>
    </>
  );
}
