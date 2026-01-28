"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import { DataLeaveService } from "../services/dataLeave.service";
import ManagementDataLeaveTable from "../components/managementDataLeaveTable";
import ManagementMasterLeaveTable from "../components/managementMasterLeaveTable";
import { useSession } from "next-auth/react";
import useSWR from "swr";

export default function ManageDataLeavePage() {
  const intraAuth = useAxiosAuth();
  const { data: session } = useSession();

  const [manualLoading, setManualLoading] = useState<boolean>(false);
  const [dataLeave, setDataLeave] = useState<DataLeaveType[]>([]);
  const [masterLeave, setMasterLeave] = useState<MasterLeaveType[]>([]);
  const [leaveByUserId, setLeaveByUserId] = useState<DataLeaveType[]>([]);
  const [user, setUser] = useState<UserType[]>([]);

  useEffect(() => {
    const autoUpdateStatus = async () => {
      try {
        const service = DataLeaveService(intraAuth);
        const allRequests = await service.getDataLeaveQuery();
        if (!allRequests || allRequests.length === 0) return;
        const now = new Date();
        const expiredRequests = allRequests.filter((req: any) => {
          if (req.status !== "approve") return false;
          if (!req.dateEnd) return false;
          const dateEnd = new Date(req.dateEnd);
          return dateEnd < now;
        });

        if (expiredRequests.length > 0) {
          await Promise.all(
            expiredRequests.map((req: any) =>
              service.updateDataLeave({
                id: req.id,
                status: "success",
              }),
            ),
          );
        }
      } catch (error) {
        console.error("Frontend auto-update status failed:", error);
      }
    };

    // ทำงานเมื่อ intraAuth พร้อม

    autoUpdateStatus();
  }, [intraAuth]);
  // ---------------------------------------------------------------------------

  // 3. Fetcher Function (เหลือแค่การดึงข้อมูลอย่างเดียว)
  const fetcher = async () => {
    const intraAuthService = DataLeaveService(intraAuth);
    const userId = session?.user?.userId;

    // เตรียม Promise
    const pDataLeave = intraAuthService.getDataLeaveQuery();
    const pMasterLeave = intraAuthService.getMasterLeaveQuery();
    const pUser = intraAuthService.getUserQuery();

    const pByUserId = intraAuthService
      .getDataLeaveByUserId(userId || "")
      .catch((err: any) => {
        console.error("Error fetching leave by userId:", err);
        return [];
      });

    // ดึงข้อมูลพร้อมกัน
    const [resDataLeave, resMasterLeave, resUser, resByUserId] =
      await Promise.all([pDataLeave, pMasterLeave, pUser, pByUserId]);

    return {
      dataLeave: resDataLeave,
      masterLeave: resMasterLeave,
      user: resUser,
      leaveByUserId: resByUserId,
    };
  };

  // 4. เรียกใช้ SWR
  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR(
    session?.user?.userId ? ["manageDataLeave", session.user.userId] : null,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      onError: () => message.error("ไม่สามารถดึงข้อมูลการลาได้"),
    },
  );

  // 5. Sync ข้อมูล
  useEffect(() => {
    if (swrData) {
      setDataLeave(swrData.dataLeave);
      setMasterLeave(swrData.masterLeave);
      setUser(swrData.user);
      setLeaveByUserId(swrData.leaveByUserId);
    }
  }, [swrData]);

  const fetchData = async () => {
    await mutate();
  };

  const loading = isSwrLoading || manualLoading;

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `จัดการข้อมูลการลา`,
      children: (
        <Card>
          <ManagementDataLeaveTable
            dataLeave={dataLeave}
            setDataLeave={setDataLeave}
            loading={loading}
            setLoading={setManualLoading}
            masterLeave={masterLeave}
            fetchData={fetchData}
            leaveByUserId={leaveByUserId}
            user={user}
          />
        </Card>
      ),
    },
    {
      key: "2",
      label: `จัดการข้อมูลประเภทการลา`,
      children: (
        <Card>
          <ManagementMasterLeaveTable
            data={masterLeave}
            loading={loading}
            setLoading={setManualLoading}
            setMasterLeave={setMasterLeave}
            masterLeave={masterLeave}
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
