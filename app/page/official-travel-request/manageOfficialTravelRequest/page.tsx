"use client";

import React, { useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";
import ManageOfficialTravelRequestTable from "../components/manageOfficialTravelRequestTable";
import { userService } from "../../user/services/user.service";
import { UserType } from "../../common";
import useSWR from "swr";

export default function page() {
  const intraAuth = useAxiosAuth();
  const [manualLoading, setManualLoading] = useState<boolean>(false);

  // 1. Fetcher Function
  const fetcher = async () => {
    const intraAuthService = officialTravelRequestService(intraAuth);
    const intraAuthUserService = userService(intraAuth);

    // ดึงข้อมูลพร้อมกัน (Parallel Fetching)
    const [resRequest, resUsers] = await Promise.all([
      intraAuthService.getOfficialTravelRequestQuery(),
      intraAuthUserService.getUserQuery(),
    ]);

    return {
      data: resRequest,
      dataUser: resUsers,
    };
  };

  // 2. เรียกใช้ SWR
  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR("manageOfficialTravelRequestPage", fetcher, {
    refreshInterval: 5000, // ยังคง refresh ทุก 5 วิ เพื่อให้เห็นสถานะที่ Backend (Cron) อัปเดตให้แล้ว
    revalidateOnFocus: true,
    onError: () => {
      message.error("ไม่สามารถดึงข้อมูลได้");
    },
  });

  // 3. Map ข้อมูลกลับมาเป็นตัวแปร
  const data: any[] = swrData?.data || [];
  const dataUser: UserType[] = swrData?.dataUser || [];

  // รวม Loading state
  const loading = isSwrLoading || manualLoading;

  // 4. Wrapper function สำหรับส่งให้ลูก (Manual Refresh ปุ่มกด)
  const fetchData = async () => {
    setManualLoading(true);
    await mutate();
    setManualLoading(false);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลขอไปราชการ",
      children: (
        <Card>
          <ManageOfficialTravelRequestTable
            data={data}
            loading={loading}
            fetchData={fetchData}
            dataUser={dataUser}
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
