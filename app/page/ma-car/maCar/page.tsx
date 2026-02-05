"use client";

import React, { useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import MaCarTable from "../components/maCarTable";
import MaCarCalendar from "../components/maCarCalendar";
import { useSession } from "next-auth/react";
import { userService } from "../../user/services/user.service";
import { MaCarType, MasterCarType, UserType } from "../../common";
import useSWR from "swr"; // 1. Import SWR
import { useSearchParams } from "next/navigation";

export default function MaCarPage() {
  const intraAuth = useAxiosAuth();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const activeTabKey = searchParams.get("tab") || "1";
  const [manualLoading, setManualLoading] = useState<boolean>(false);

  // 3. สร้าง Fetcher Function
  const fetcher = async () => {
    const intraAuthService = maCarService(intraAuth);
    const intraAuthUserService = userService(intraAuth);
    const userId = session?.user?.userId;
    const [resMaCar, resCars, resUsers] = await Promise.all([
      intraAuthService.getMaCarQuery(),
      intraAuthService.getMasterCarQuery(),
      intraAuthUserService.getUserQuery(),
    ]);

    const resMaCarUser = resMaCar.filter(
      (car: any) => car.createdById === userId,
    );

    return {
      data: resMaCar,
      cars: resCars,
      users: resUsers,
      maCarUser: resMaCarUser,
    };
  };

  // 4. เรียกใช้ SWR
  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR(
    session?.user?.userId ? ["maCarPage", session.user.userId] : null,
    fetcher,
    {
      refreshInterval: 5000, // อัปเดตข้อมูลทุก 5 วินาที
      revalidateOnFocus: true,
      onError: () => {
        message.error("ไม่สามารถดึงข้อมูลรถได้");
      },
    },
  );

  // 5. Map ข้อมูลกลับมาเป็นตัวแปร (ใช้ค่าว่างป้องกัน Error)
  const data: MaCarType[] = swrData?.data || [];
  const cars: MasterCarType[] = swrData?.cars || [];
  const dataUser: UserType[] = swrData?.users || [];
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
      label: "ข้อมูลปฏิทินจองรถ",
      children: (
        <Card>
          <MaCarCalendar
            data={data}
            loading={loading}
            fetchData={fetchData}
            cars={cars}
            dataUser={dataUser}
          />
        </Card>
      ),
    },
    {
      key: "2",
      label: "ข้อมูลตารางการจองรถ",
      children: (
        <Card>
          <MaCarTable
            data={data}
            loading={loading}
            // ถ้า Child Component มีการใช้ setLoading ให้ส่ง setManualLoading ไปแทน
            // setLoading={setManualLoading}
            fetchData={fetchData}
            dataUser={dataUser}
            cars={cars}
            maCarUser={maCarUser}
          />
        </Card>
      ),
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Tabs defaultActiveKey={activeTabKey} items={items} />
      </Col>
    </Row>
  );
}
