"use client";

import React, { useState } from "react";
import { Tabs, Row, Col, Card } from "antd";
import type { TabsProps } from "antd";
import MedicalEquipmentTable from "../components/medicalEquipmentTable";
import {
  MaMedicalEquipmentType,
  MedicalEquipmentType,
} from "../../common/index";
import CreateMedicalEquipmentForm from "../components/medicalEquipmentForm";
import EquipmentTable from "../components/equipmentTable";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import { useSession } from "next-auth/react";
import useSWR from "swr"; // 1. Import SWR

export default function Page() {
  const intraAuth = useAxiosAuth();
  const { data: session } = useSession();

  // 2. แยก manualLoading สำหรับ Action ต่างๆ จาก Component ลูก
  const [manualLoading, setManualLoading] = useState<boolean>(false);

  // 3. สร้าง Fetcher Function
  const fetcher = async () => {
    const intraAuthService = maMedicalEquipmentServices(intraAuth);

    // ดึงข้อมูลพร้อมกัน
    const [resData, resEQ] = await Promise.all([
      intraAuthService.getMaMedicalEquipmentQuery(),
      intraAuthService.getMedicalEquipmentQuery(),
    ]);

    return {
      data: resData,
      dataEQ: resEQ,
    };
  };

  // 4. เรียกใช้ SWR
  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR("medicalEquipmentPage", fetcher, {
    refreshInterval: 5000, // อัปเดตข้อมูลทุก 5 วินาที
    revalidateOnFocus: true,
    onError: (error) => {
      console.error("Failed to fetch data:", error);
    },
  });

  // 5. Map ข้อมูล (ใช้ Array ว่างเป็น Default)
  const data: MaMedicalEquipmentType[] = swrData?.data || [];
  const dataEQ: MedicalEquipmentType[] = swrData?.dataEQ || [];

  // รวม Loading state
  const loading = isSwrLoading || manualLoading;

  // 6. Wrapper function สำหรับส่งให้ลูก (เพื่อให้ Type ตรงกับ Promise<void> และจัดการ Loading)
  const fetchData = async () => {
    setManualLoading(true);
    await mutate();
    setManualLoading(false);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลการส่งเครื่องมือแพทย์",
      children: (
        <MedicalEquipmentTable
          setLoading={setManualLoading} // ใช้ manualLoading แทน
          loading={loading}
          data={data}
          fetchData={fetchData}
          dataEQ={dataEQ}
        />
      ),
    },
    {
      key: "2",
      label: "ส่งเครื่องมือแพทย์",
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
            ส่งเครื่องมือแพทย์
          </div>

          <CreateMedicalEquipmentForm
            setLoading={setManualLoading}
            dataEQ={dataEQ}
            data={data}
            fetchData={fetchData}
          />
        </Card>
      ),
    },
    ...(session?.user?.role === "admin" || session?.user?.role === "pharmacy"
      ? [
          {
            key: "3",
            label: "ข้อมูลเครื่องมือแพทย์ทั้งหมด",
            children: (
              <EquipmentTable
                setLoading={setManualLoading}
                loading={loading}
                dataEQ={dataEQ}
                fetchData={fetchData}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Tabs defaultActiveKey="1" items={items} destroyInactiveTabPane />
        </Col>
      </Row>
    </div>
  );
}
