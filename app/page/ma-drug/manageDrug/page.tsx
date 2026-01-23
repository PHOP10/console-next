"use client";

import React, { useState, useEffect } from "react";
import { Breadcrumb, Col, Divider, message, Row, Tabs, TabsProps } from "antd";
import MaDrugDaisbursementTable from "../components/manageDrugTable";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { MaDrugType } from "../../common";

export default function Page() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);
  const [loading, setLoading] = useState<boolean>(true);
  const { data: session } = useSession();
  const [data, setData] = useState<MaDrugType[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await intraAuthService.getMaDrugQuery();
      setData(Array.isArray(result) ? result : result?.data || []);
    } catch (error) {
      console.error("โหลดข้อมูลไม่สำเร็จ:", error);
      message.error("ไม่สามารถดึงข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ❌ ลบ useEffect ที่ซ้ำซ้อนออก (fetchData จัดการ loading ใน finally แล้ว)
  // useEffect(() => {
  //   setLoading(false);
  // }, []);

  // ✅ วิธีแก้ไข: สร้าง Array ว่างก่อน แล้วใช้ if push ข้อมูลเข้าไป
  const items: TabsProps["items"] = [];

  if (session?.user?.role === "admin") {
    items.push({
      key: "1",
      label: "จัดการข้อมูลการเบิกจ่ายยา",
      children: (
        <MaDrugDaisbursementTable
          data={data}
          fetchData={fetchData}
          setData={setData}
        />
      ),
    });
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Tabs defaultActiveKey="1" items={items} />
        </Col>
      </Row>
    </div>
  );
}
