"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import { useSession } from "next-auth/react"; // 1. นำเข้า useSession
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "./services/user.service";
import UserTable from "./components/userTable";
import UserProfile from "./components/UserProfile";

export default function UserPage() {
  // 2. ดึงข้อมูล session
  const { data: session } = useSession();

  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);

  // ฟังก์ชันดึงข้อมูลสำหรับ Tab 1 (ตารางรายชื่อผู้ใช้)
  const fetchData = async () => {
    // เพิ่มการตรวจสอบ: ถ้าไม่ใช่ admin ไม่ต้องดึงข้อมูลส่วนนี้ เพื่อความปลอดภัยและลดโหลด
    if (session?.user?.role !== "admin") return;

    setLoading(true);
    try {
      const res = await intraAuthService.getUserQuery();
      setData(res);
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // เรียก fetchData เมื่อ session โหลดเสร็จและเป็น admin
    if (session?.user?.role === "admin") {
      fetchData();
    }
  }, [session]); // dependency เป็น session เพื่อให้ทำงานเมื่อโหลดข้อมูลผู้ใช้เสร็จ

  // 3. สร้าง items สำหรับ Tabs ตามเงื่อนไข
  const items: TabsProps["items"] = [];

  // ถ้าเป็น admin ให้เพิ่ม Tab "ข้อมูลผู้ใช้" (Key 1)
  if (session?.user?.role === "admin") {
    items.push({
      key: "1",
      label: "ข้อมูลผู้ใช้",
      children: (
        <Card bordered={false} bodyStyle={{ padding: 0 }}>
          <UserTable
            data={data}
            loading={loading}
            fetchData={fetchData}
            setData={setData}
          />
        </Card>
      ),
    });
  }

  // Tab "โปรไฟล์" (Key 2) แสดงให้ทุกคนเห็น
  items.push({
    key: "2",
    label: "โปรไฟล์",
    children: (
      <div style={{ backgroundColor: "#fff", minHeight: "100%" }}>
        <UserProfile />
      </div>
    ),
  });

  // ถ้ายังโหลด Session ไม่เสร็จ อาจจะ return null หรือ loading ไปก่อนได้
  if (!session) return null;

  return (
    <Row>
      <Col span={24}>
        <Card
          bordered={false}
          bodyStyle={{ padding: 0 }}
          style={{
            backgroundColor: "transparent",
            border: "none",
            boxShadow: "none",
          }}
        >
          {/* 4. ถ้าเป็น admin ให้ default ที่ tab 1 ถ้าไม่ใช่ให้ไป tab 2 */}
          <Tabs
            defaultActiveKey={session?.user?.role === "admin" ? "1" : "2"}
            items={items}
          />
        </Card>
      </Col>
    </Row>
  );
}
