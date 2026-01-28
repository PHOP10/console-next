"use client";

import React, { useState, useEffect } from "react";
import { Col, message, Row, Tabs, TabsProps } from "antd";
import DataDrugTable from "../components/drugTable";
import DataDrugForm from "../components/drugForm";
import DrugTypeTable from "../components/drugTypeTable";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType } from "../../common";
import useSWR from "swr"; // 1. Import SWR

export default function Page() {
  const intraAuth = useAxiosAuth();

  // 2. สร้าง manualLoading สำหรับการกดปุ่มต่างๆ ใน Component ลูก
  const [manualLoading, setManualLoading] = useState<boolean>(false);

  // 3. คง useState ไว้เพื่อรองรับ props 'setData' ที่ต้องส่งให้ลูก
  const [data, setData] = useState<DrugType[]>([]);

  // 4. สร้าง Fetcher Function
  const fetcher = async () => {
    const intraAuthService = MaDrug(intraAuth);
    const result = await intraAuthService.getDrugQuery();
    // จัดการข้อมูลให้เป็น Array เสมอ
    return Array.isArray(result) ? result : result?.data || [];
  };

  // 5. เรียกใช้ SWR
  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate, // สามารถส่งไปให้ลูกใช้ refresh ได้ถ้าจำเป็น
  } = useSWR("drugDataPage", fetcher, {
    refreshInterval: 5000, // อัปเดตข้อมูลอัตโนมัติทุก 5 วินาที
    revalidateOnFocus: true,
    onError: (error) => {
      console.error("โหลดข้อมูลยาไม่สำเร็จ:", error);
      message.error("ไม่สามารถดึงข้อมูลยาได้");
    },
  });

  // 6. Sync ข้อมูลจาก SWR เข้า State
  useEffect(() => {
    if (swrData) {
      setData(swrData);
    }
  }, [swrData]);

  // รวม Loading state
  const loading = isSwrLoading || manualLoading;

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลยา",
      children: (
        <DataDrugTable
          setLoading={setManualLoading} // ใช้ manualLoading แทน
          loading={loading}
          data={data}
          setData={setData} // ส่ง state setter ได้เหมือนเดิม
        />
      ),
    },
    {
      key: "2",
      label: "เพิ่มยา",
      children: (
        <DataDrugForm
          setLoading={setManualLoading}
          loading={loading}
          setData={setData} // ส่ง state setter ได้เหมือนเดิม
        />
      ),
    },
    { key: "3", label: "ประเภทยา", children: <DrugTypeTable /> },
  ];

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
