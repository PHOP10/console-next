"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import { DataLeaveService } from "../services/dataLeave.service";
import DataLeaveTable from "../components/dataLeaveTable";
import DataLeaveCalendar from "../components/dataLeaveCalendar";
import { useSession } from "next-auth/react";

export default function DataLeavePage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<DataLeaveType[]>([]);
  const [masterLeaves, setMasterLeaves] = useState<MasterLeaveType[]>([]);
  const [leaveByUserId, setLeaveByUserId] = useState<DataLeaveType[]>([]);
  const [user, setUser] = useState<UserType[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await intraAuthService.getDataLeaveQuery();
      const dataMasterLeaves = await intraAuthService.getMasterLeaveQuery();
      const userId = session?.user?.userId;
      const byUserId = await intraAuthService.getDataLeaveByUserId(
        userId || ""
      );
      const userAll = await intraAuthService.getUserQuery();
      setUser(userAll);
      setLeaveByUserId(byUserId);
      setData(res);
      setMasterLeaves(dataMasterLeaves);
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
      label: "ข้อมูลปฏิทินการลา",
      children: (
        <Card>
          <DataLeaveCalendar
            data={data}
            loading={loading}
            fetchData={fetchData}
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
            setLoading={setLoading}
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
        <Tabs defaultActiveKey="1" items={items} destroyInactiveTabPane />
      </Col>
    </Row>
  );
}
