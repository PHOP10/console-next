"use client";

import React, { useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import ManageMaCarTable from "../components/manageMaCarTable";
import ManageCarTable from "../components/manageCarTable";
import { MaCarType, MasterCarType } from "../../common";
import { useSession } from "next-auth/react";
import useSWR from "swr"; // 1. Import SWR

export default function ManageMaCarPage() {
  const intraAuth = useAxiosAuth();
  const { data: session } = useSession();

  // 2. แยก manualLoading สำหรับ Action ต่างๆ (เช่น กดลบ/แก้ไข ในตาราง)
  const [manualLoading, setManualLoading] = useState<boolean>(false);

  // 3. สร้าง Fetcher Function
  const fetcher = async () => {
    const intraAuthService = maCarService(intraAuth);

    // ใช้ Promise.all ดึงข้อมูลพร้อมกัน 3 ส่วน (ลดเวลาโหลด)
    const [resMaCar, resCars, resUsers] = await Promise.all([
      intraAuthService.getMaCarQuery(), // รายการจองรถ
      intraAuthService.getMasterCarQuery(), // ข้อมูลรถ
      intraAuthService.getUserQuery(), // ข้อมูลผู้ใช้
    ]);

    // Filter ข้อมูลของ User ปัจจุบัน (ใช้ข้อมูลจาก resMaCar ที่ดึงมาแล้วได้เลย)
    const resMaCarUser = resMaCar.filter(
      (car: any) => car.createdById === session?.user?.userId,
    );

    return {
      data: resMaCar,
      dataCar: resCars,
      dataUser: resUsers,
      maCarUser: resMaCarUser,
    };
  };

  // 4. เรียกใช้ SWR
  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR(
    session?.user?.userId ? ["manageMaCarPage", session.user.userId] : null,
    fetcher,
    {
      refreshInterval: 5000, // อัปเดตอัตโนมัติทุก 5 วินาที
      revalidateOnFocus: true,
      onError: () => {
        message.error("ไม่สามารถดึงข้อมูลรถได้");
      },
    },
  );

  // 5. Map ข้อมูลกลับมาเป็นตัวแปร (ใช้ Array ว่างเป็น Default เพื่อป้องกัน Error)
  const data: MaCarType[] = swrData?.data || [];
  const dataCar: MasterCarType[] = swrData?.dataCar || [];
  const dataUser: any[] = swrData?.dataUser || [];
  const maCarUser: MaCarType[] = swrData?.maCarUser || [];

  // รวม Loading state
  const loading = isSwrLoading || manualLoading;

  // 6. Wrapper function สำหรับส่งให้ลูก (เพื่อให้ Type ตรงกับ Promise<void>)
  const fetchData = async () => {
    await mutate();
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "จัดการรายการจองรถ",
      children: (
        <Card>
          <ManageMaCarTable
            data={data}
            loading={loading}
            fetchData={fetchData}
            dataUser={dataUser}
            cars={dataCar}
            maCarUser={maCarUser}
          />
        </Card>
      ),
    },
    {
      key: "2",
      label: "จัดการรถ",
      children: (
        <Card>
          <ManageCarTable
            dataCar={dataCar}
            loading={loading}
            setLoading={setManualLoading} // ส่ง setManualLoading ไปใช้แทน
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
