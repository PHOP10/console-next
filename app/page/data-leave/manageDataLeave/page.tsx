"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import { DataLeaveService } from "../services/dataLeave.service";
import ManagementDataLeaveTable from "../components/managementDataLeaveTable";
import ManagementMasterLeaveTable from "../components/managementMasterLeaveTable";
import { useSession } from "next-auth/react";

export default function ManageDataLeavePage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [dataLeave, setDataLeave] = useState<DataLeaveType[]>([]);
  const [masterLeave, setMasterLeave] = useState<MasterLeaveType[]>([]);
  const [leaveByUserId, setLeaveByUserId] = useState<DataLeaveType[]>([]);
  const [user, setUser] = useState<UserType[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await intraAuthService.getDataLeaveQuery();
      const dataMasterLeaves = await intraAuthService.getMasterLeaveQuery();
      const userId = session?.user?.userId;
      try {
        const byUserId = await intraAuthService.getDataLeaveByUserId(
          userId || ""
        );
        setLeaveByUserId(byUserId);
      } catch (err: any) {
        console.error("Axios error:", err.config.url, err.response?.status);
      }
      const userAll = await intraAuthService.getUserQuery();
      setUser(userAll);
      // setLeaveByUserId(byUserId);
      setDataLeave(res);
      setMasterLeave(dataMasterLeaves);
    } catch (err) {
      message.error("ไม่สามารถดึงข้อมูลการลาได้");
    } finally {
      setLoading(false);
    }
  }, [intraAuthService]);

  useEffect(() => {
    if (loading) fetchData();
  }, [loading, fetchData]);

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
            setLoading={setLoading}
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
      label: `จัดการข้อมูลประเภทลา`,
      children: (
        <Card>
          <ManagementMasterLeaveTable
            data={masterLeave}
            loading={loading}
            setLoading={setLoading}
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
