"use client";

import React, { useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import MaCarBookForm from "../components/maCarBookForm";
import { MaCarType, MasterCarType } from "../../common";
import { useSession } from "next-auth/react";
import useSWR from "swr"; // 1. Import SWR

export default function MaCarPage() {
  const intraAuth = useAxiosAuth();
  const { data: session } = useSession();

  // 2. แยก loading สำหรับการกระทำแบบ Manual (เพื่อให้ Form แสดง Loading ตอนกด Save ได้เหมือนเดิม)
  const [manualLoading, setManualLoading] = useState<boolean>(false);

  // 3. สร้าง Fetcher Function รวม API ทั้งหมด
  const fetcher = async () => {
    const intraAuthService = maCarService(intraAuth);

    // ดึงข้อมูลพร้อมกัน 3 API เพื่อความเร็ว
    const [resCars, resMaCar, resUsers] = await Promise.all([
      intraAuthService.getMasterCarQuery(),
      intraAuthService.getMaCarQuery(),
      intraAuthService.getUserQuery(),
    ]);

    const resMaCarUser = resMaCar.filter(
      (car: any) => car.createdById === session?.user?.userId,
    );

    return {
      cars: resCars,
      maCar: resMaCar,
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
    session?.user?.userId ? ["maCarBookingPage", session.user.userId] : null,
    fetcher,
    {
      refreshInterval: 5000, // อัปเดตข้อมูลทุก 5 วินาที
      revalidateOnFocus: true, // อัปเดตเมื่อกลับมาที่หน้าจอ
      onError: () => {
        message.error("ไม่สามารถดึงข้อมูลได้");
      },
    },
  );

  // 5. Map ข้อมูลกลับมาเป็นตัวแปร (ใช้ Array ว่างเป็นค่า Default)
  const cars: MasterCarType[] = swrData?.cars || [];
  const dataUser: any[] = swrData?.dataUser || [];
  const maCarUser: MaCarType[] = swrData?.maCarUser || [];
  const maCar: MaCarType[] = swrData?.maCar || [];

  // รวม Loading state (SWR โหลดครั้งแรก หรือ สั่งโหลดแบบ Manual)
  const loading = isSwrLoading || manualLoading;

  // 6. Wrapper function สำหรับส่งให้ลูก (Mimic พฤติกรรมเดิมที่ Loading จะหมุนเมื่อเรียก fetchData)
  const fetchData = async () => {
    setManualLoading(true); // สั่ง Loading หมุน
    await mutate();
    setManualLoading(false); // หยุดหมุน
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "จองรถ",
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
            แบบฟอร์มขอใช้รถราชการ
          </div>

          <MaCarBookForm
            cars={cars}
            dataUser={dataUser}
            loading={loading}
            fetchData={fetchData} // ส่ง Wrapper function ไป
            maCarUser={maCarUser}
            maCar={maCar}
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
