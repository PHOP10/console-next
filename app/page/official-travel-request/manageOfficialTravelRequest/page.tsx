"use client";

import React, { useState, useEffect } from "react"; // 1. เพิ่ม useEffect
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

  useEffect(() => {
    const autoUpdateStatus = async () => {
      try {
        const service = officialTravelRequestService(intraAuth);
        const allRequests = await service.getOfficialTravelRequestQuery();
        if (!allRequests || allRequests.length === 0) return;
        const now = new Date();
        const expiredRequests = allRequests.filter((req: any) => {
          if (req.status !== "approve") return false; // เอาเฉพาะสถานะ approved
          if (!req.endDate) return false;
          const endDate = new Date(req.endDate);
          return endDate < now;
        });
        if (expiredRequests.length > 0) {
          await Promise.all(
            expiredRequests.map((req: any) =>
              service.updateOfficialTravelRequest({
                id: req.id,
                status: "success",
              }),
            ),
          );
        }
      } catch (error) {
        console.error("Frontend auto-update failed:", error);
      }
    };

    autoUpdateStatus();
  }, [intraAuth]);
  // ---------------------------------------------------------------------------

  // 3. Fetcher Function (คงเดิม 100%)
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

  // 4. เรียกใช้ SWR (คงเดิม 100%)
  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR("manageOfficialTravelRequestPage", fetcher, {
    refreshInterval: 5000, // อัปเดตข้อมูลอัตโนมัติทุก 5 วินาที
    revalidateOnFocus: true,
    onError: () => {
      message.error("ไม่สามารถดึงข้อมูลได้");
    },
  });

  // 5. Map ข้อมูลกลับมาเป็นตัวแปร
  const data: any[] = swrData?.data || [];
  const dataUser: UserType[] = swrData?.dataUser || [];

  // รวม Loading state
  const loading = isSwrLoading || manualLoading;

  // 6. Wrapper function สำหรับส่งให้ลูก
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
