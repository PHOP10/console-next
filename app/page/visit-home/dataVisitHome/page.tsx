"use client";

import React, { useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { visitHomeServices } from "../services/visitHome.service";
import VisitHomeTable from "../components/visitHomeTable";
import { MasterPatientType, VisitHomeType } from "../../common";
import useSWR from "swr"; // 1. Import SWR

export default function VisitHomePage() {
  const intraAuth = useAxiosAuth();

  // 2. สร้าง manualLoading สำหรับการกด Action ในตาราง (เช่น ลบ/แก้ไข)
  const [manualLoading, setManualLoading] = useState<boolean>(false);

  // 3. สร้าง Fetcher Function
  const fetcher = async () => {
    const intraAuthService = visitHomeServices(intraAuth);

    // ดึงข้อมูลพร้อมกัน
    const [resData, resMaster] = await Promise.all([
      intraAuthService.getVisitHomeQuery(),
      intraAuthService.getMasterPatientQuery(),
    ]);

    return {
      data: resData,
      masterPatients: resMaster,
    };
  };

  // 4. เรียกใช้ SWR
  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR("visitHomeTablePage", fetcher, {
    refreshInterval: 5000, // อัปเดตข้อมูลทุก 5 วินาที
    revalidateOnFocus: true,
    onError: () => {
      message.error("ไม่สามารถดึงข้อมูลการเยี่ยมบ้านได้");
    },
  });

  // 5. Map ข้อมูล (ใช้ Array ว่างเป็น Default)
  const data: VisitHomeType[] = swrData?.data || [];
  const masterPatients: MasterPatientType[] = swrData?.masterPatients || [];

  // รวม Loading state
  const loading = isSwrLoading || manualLoading;

  // 6. Wrapper function สำหรับส่งให้ลูก (เพื่อให้ Type ตรงกับ Promise<void>)
  const fetchData = async () => {
    await mutate();
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `ข้อมูลการเยี่ยมบ้าน`,
      children: (
        <VisitHomeTable
          data={data}
          loading={loading}
          setLoading={setManualLoading} // ส่ง manualLoading setter ไป
          fetchData={fetchData}
          masterPatients={masterPatients}
        />
      ),
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Tabs defaultActiveKey="1" items={items} />
      </Col>
    </Row>
  );
}
