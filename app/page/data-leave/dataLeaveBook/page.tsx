"use client";

import React, { useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import { DataLeaveService } from "../services/dataLeave.service";
import LeaveBookingForm from "../components/leaveBookingForm";
import { useSession } from "next-auth/react";
import useSWR from "swr"; // 1. import SWR

export default function DataLeavePage() {
  const intraAuth = useAxiosAuth();
  const { data: session } = useSession();

  // 2. แยก state สำหรับ loading ที่เกิดจากการกระทำใน Form (เช่น กดบันทึก)
  const [manualLoading, setManualLoading] = useState<boolean>(false);

  // 3. สร้าง Fetcher รวม Logic การดึงและการกรองข้อมูล
  const fetcher = async () => {
    const intraAuthService = DataLeaveService(intraAuth);
    const currentUserId = session?.user?.userId;

    const [dataRes, masterRes, byUserId, userAll] = await Promise.all([
      intraAuthService.getDataLeaveQuery(),
      intraAuthService.getMasterLeaveQuery(),
      intraAuthService.getDataLeaveByUserId(currentUserId || ""),
      intraAuthService.getUserQuery(),
    ]);

    // Logic กรอง User ที่ไม่ใช่ตัวเอง (ย้ายมาจาก fetchData เดิม)
    const filteredUsers = userAll.filter(
      (u: any) => u.userId !== currentUserId,
    );

    return {
      data: dataRes,
      masterLeaves: masterRes,
      leaveByUserId: byUserId,
      user: filteredUsers,
    };
  };

  // 4. เรียกใช้ SWR
  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR(
    session?.user?.userId ? ["bookingPage", session.user.userId] : null,
    fetcher,
    {
      refreshInterval: 5000, // เช็คข้อมูลใหม่ทุก 5 วิ (เผื่อโควตาวันลาเปลี่ยน หรือมีใครลาตัดหน้า)
      revalidateOnFocus: true,
      onError: () => {
        message.error("ไม่สามารถดึงข้อมูลได้");
      },
    },
  );

  // 5. Map ข้อมูลกลับมาเป็นตัวแปร (Default เป็น array ว่างป้องกัน error)
  const masterLeaves: MasterLeaveType[] = swrData?.masterLeaves || [];
  const leaveByUserId: DataLeaveType[] = swrData?.leaveByUserId || [];
  const user: UserType[] = swrData?.user || [];

  // รวม Loading: SWR กำลังโหลด หรือ ฟอร์มกำลังทำงาน
  const loading = isSwrLoading || manualLoading;

  // 6. Wrapper function เพื่อแก้ปัญหา Type Mismatch (Promise<void>)
  const fetchData = async () => {
    await mutate();
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `ยื่นใบลา`,
      children: (
        <Card>
          <LeaveBookingForm
            loading={loading}
            setLoading={setManualLoading} // ส่ง state นี้ให้ลูกใช้คุมตอนกด Submit
            masterLeaves={masterLeaves}
            leaveByUserId={leaveByUserId}
            user={user}
            fetchData={fetchData} // ส่ง Wrapper ไป
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
