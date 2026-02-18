"use client";
import { Button, Result, Spin } from "antd";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin />
      </div>
    );
  }

  return (
    <Result
      status="404"
      title="Unauthorized"
      subTitle="ไม่มีสิทธิเข้าถึงระบบ"
      extra={
        <Button
          type="primary"
          onClick={() => signOut({ callbackUrl: "/", redirect: true })}
        >
          เข้าสู่ระบบ
        </Button>
      }
    />
  );
}
