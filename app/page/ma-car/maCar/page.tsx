"use client";

import React, { useState, useMemo } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import MaCarTable from "../components/maCarTable";
import MaCarCalendar from "../components/maCarCalendar";
import { useSession } from "next-auth/react";
import { userService } from "../../user/services/user.service";
import { MaCarType, MasterCarType, UserType } from "../../common";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";

export default function MaCarPage() {
  const intraAuth = useAxiosAuth();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const activeTabKey = searchParams.get("tab") || "1";
  const [manualLoading, setManualLoading] = useState<boolean>(false);

  const fetcher = async () => {
    const intraAuthService = maCarService(intraAuth);
    const intraAuthUserService = userService(intraAuth);

    // ✅ ตัด userId ออกจาก fetcher เพราะ API 3 ตัวนี้ไม่จำเป็นต้องใช้ userId ในการดึง
    const [resMaCar, resCars, resUsers] = await Promise.all([
      intraAuthService.getMaCarQuery(),
      intraAuthService.getMasterCarQuery(),
      intraAuthUserService.getUserQuery(),
    ]);

    return {
      data: resMaCar,
      cars: resCars,
      users: resUsers,
      // maCarUser: ... ตัดออก (ไปคำนวณข้างนอกแทน)
    };
  };

  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR(
    // ✅ จุดที่แก้: ใส่ userId เข้าไปใน Key เพื่อบังคับให้ SWR ยิงใหม่ทันทีที่ Session มา
    ["maCarPage", session?.user?.userId],
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,

      onError: (err) => {
        // กัน Error 401 เด้งตอน session ยังไม่มา
        if (session?.user?.userId) {
          message.error("ไม่สามารถดึงข้อมูลรถได้");
        }
      },
    },
  );

  const data: MaCarType[] = swrData?.data || [];
  const cars: MasterCarType[] = swrData?.cars || [];
  const dataUser: UserType[] = swrData?.users || [];

  // ✅ คำนวณ "รถของฉัน" ที่ Client Side แทน
  // ข้อมูลจะมาทันที และเมื่อ Session โหลดเสร็จ ตัวแปรนี้จะอัปเดตเองโดยไม่ต้องดึง API ใหม่
  const maCarUser = useMemo(() => {
    if (!session?.user?.userId) return [];
    return data.filter((car: any) => car.createdById === session.user.userId);
  }, [data, session?.user?.userId]);

  const loading = isSwrLoading || manualLoading;

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
