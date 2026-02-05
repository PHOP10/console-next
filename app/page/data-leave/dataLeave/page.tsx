"use client";

import React, { useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import { DataLeaveService } from "../services/dataLeave.service";
import DataLeaveTable from "../components/dataLeaveTable";
import DataLeaveCalendar from "../components/dataLeaveCalendar";
import { useSession } from "next-auth/react";
import useSWR from "swr"; // 1. นำเข้า SWR
import { useSearchParams } from "next/navigation";

export default function DataLeavePage() {
  const intraAuth = useAxiosAuth();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const activeTabKey = searchParams.get("tab") || "1";
  // 2. สร้าง local state สำหรับ loading กรณีที่ component ลูกสั่ง setLoading เอง (เช่น ตอนกดลบ หรือแก้ไข)
  const [manualLoading, setManualLoading] = useState<boolean>(false);

  // 3. สร้าง Fetcher Function ที่รวบรวมการดึงข้อมูลทั้งหมดไว้ในที่เดียว
  const fetcher = async () => {
    // เรียก Service ภายในนี้เพื่อให้ได้ instance ล่าสุดเสมอ
    const intraAuthService = DataLeaveService(intraAuth);
    const userId = session?.user?.userId;

    // ใช้ Promise.all เพื่อดึงทุก API พร้อมกัน (เร็วกว่าเดิม)
    const [res, dataMasterLeaves, byUserId, userAll] = await Promise.all([
      intraAuthService.getDataLeaveQuery(),
      intraAuthService.getMasterLeaveQuery(),
      intraAuthService.getDataLeaveByUserId(userId || ""),
      intraAuthService.getUserQuery(),
    ]);

    // Return ออกไปเป็นก้อนเดียว
    return {
      data: res,
      masterLeaves: dataMasterLeaves,
      leaveByUserId: byUserId,
      user: userAll,
    };
  };

  // 4. เรียกใช้ SWR
  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR(
    session?.user?.userId ? ["dataLeavePage", session.user.userId] : null, // Key จะทำงานเมื่อมี User ID
    fetcher,
    {
      refreshInterval: 5000, // ดึงข้อมูลใหม่ทุก 5 วินาที (Sync ข้าม Browser)
      revalidateOnFocus: true, // ดึงใหม่ทันทีเมื่อสลับหน้าจอกลับมา
      onError: () => {
        message.error("ไม่สามารถดึงข้อมูลการลาได้");
      },
    },
  );

  // 5. Map ข้อมูลจาก SWR กลับมาเป็นตัวแปรชื่อเดิม (เพื่อไม่ให้กระทบ code ส่วนอื่น)
  const data: DataLeaveType[] = swrData?.data || [];
  const masterLeaves: MasterLeaveType[] = swrData?.masterLeaves || [];
  const leaveByUserId: DataLeaveType[] = swrData?.leaveByUserId || [];
  const user: UserType[] = swrData?.user || [];

  // รวม Loading state: คือตอน SWR กำลังโหลดครั้งแรก OR ลูกสั่ง Loading เอง
  const loading = isSwrLoading || manualLoading;

  // แปลง mutate ของ SWR ให้เป็นชื่อ fetchData เพื่อส่งให้ลูกเรียกใช้ได้เหมือนเดิม
  const fetchData = async () => {
    await mutate();
    // ไม่มีการ return ค่าใดๆ ออกไป จะถือว่าเป็น Promise<void> โดยอัตโนมัติ
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลปฏิทินการลา",
      children: (
        <Card>
          <DataLeaveCalendar
            data={data}
            loading={loading}
            fetchData={fetchData}
            dataUser={user}
          />
        </Card>
      ),
    },
    {
      key: "2",
      label: `ข้อมูลตารางการลา`,
      children: (
        <Card>
          <DataLeaveTable
            data={data}
            loading={loading}
            setLoading={setManualLoading} // ส่ง state นี้ให้ลูกใช้คุม Loading ตอนทำ Action อื่นๆ
            masterLeaves={masterLeaves}
            fetchData={fetchData}
            leaveByUserId={leaveByUserId}
            user={user}
          />
        </Card>
      ),
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Tabs
          defaultActiveKey={activeTabKey}
          items={items}
          destroyInactiveTabPane
        />
      </Col>
    </Row>
  );
}
