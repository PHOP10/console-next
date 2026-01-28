"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { visitHomeServices } from "../services/visitHome.service";
import VisitHomeForm from "../components/visitHomeForm";
import { MasterPatientType, VisitHomeType } from "../../common";
import MasterPatientTable from "../components/masterPatientTable";
import useSWR from "swr"; // 1. Import SWR

export default function VisitHomePage() {
  const intraAuth = useAxiosAuth();

  // 2. แยก manualLoading สำหรับการกดปุ่มต่างๆ (เช่น บันทึก/แก้ไข)
  const [manualLoading, setManualLoading] = useState<boolean>(false);

  // 3. คง useState ไว้สำหรับ dataMasterPatient เพราะต้องส่ง setter ให้ Component ลูก
  const [data, setData] = useState<VisitHomeType[]>([]);
  const [dataMasterPatient, setDataMasterPatient] = useState<
    MasterPatientType[]
  >([]);

  // 4. สร้าง Fetcher Function
  const fetcher = async () => {
    const intraAuthService = visitHomeServices(intraAuth);

    // ดึงข้อมูลพร้อมกัน
    const [resVisitHome, resMasterPatient] = await Promise.all([
      intraAuthService.getVisitHomeQuery(),
      intraAuthService.getMasterPatientQuery(),
    ]);

    return {
      visitHome: resVisitHome.data, // อิงตามโค้ดเดิมที่ใช้ res.data
      masterPatient: resMasterPatient,
    };
  };

  // 5. เรียกใช้ SWR
  const { data: swrData, isLoading: isSwrLoading } = useSWR(
    "visitHomePage", // Key
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      onError: () => message.error("ไม่สามารถดึงข้อมูลการเยี่ยมบ้านได้"),
    },
  );

  // 6. Sync ข้อมูลจาก SWR เข้า State (เพื่อให้ส่ง props setDataMasterPatient ได้เหมือนเดิม)
  useEffect(() => {
    if (swrData) {
      setData(swrData.visitHome);
      setDataMasterPatient(swrData.masterPatient);
    }
  }, [swrData]);

  // รวม Loading
  const loading = isSwrLoading || manualLoading;

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `การเยี่ยมบ้าน`,
      children: (
        <Card>
          <div
            style={{
              textAlign: "center",
              color: "#0683e9",
              fontWeight: "bold",
              fontSize: "24px",
              marginTop: "-8px",
              marginBottom: "15px",
            }}
          >
            แบบฟอร์มบันทึกการดูแลผู้ป่วยที่บ้าน
          </div>
          <VisitHomeForm />
        </Card>
      ),
    },
    {
      key: "2",
      label: `ประเภทผู้ป่วย`,
      children: (
        <Card>
          <MasterPatientTable
            dataMasterPatient={dataMasterPatient}
            setDataMasterPatient={setDataMasterPatient} // ส่ง state setter ได้ปกติ
            setLoading={setManualLoading} // ใช้ manualLoading แทน
          />
        </Card>
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
