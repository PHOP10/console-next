"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import { DataLeaveService } from "../services/dataLeave.service";
import LeaveBookingForm from "../components/leaveBookingForm";
import { useSession } from "next-auth/react";

export default function DataLeavePage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DataLeaveType[]>([]);
  const [masterLeaves, setMasterLeaves] = useState<MasterLeaveType[]>([]);
  const [leaveByUserId, setLeaveByUserId] = useState<DataLeaveType[]>([]);
  const [user, setUser] = useState<UserType[]>([]);

  // useEffect(() => {
  //   const fetchAll = async () => {
  //     try {
  //       setLoading(true);

  //       const [dataRes, masterRes] = await Promise.all([
  //         intraAuthService.getDataLeaveQuery(),
  //         intraAuthService.getMasterLeaveQuery(),
  //       ]);
  //       const userId = session?.user?.userId;
  //       const byUserId = await intraAuthService.getDataLeaveByUserId(
  //         userId || ""
  //       );
  //       const user = await intraAuthService.getUserQuery();
  //       setUser(user);
  //       setLeaveByUserId(byUserId);
  //       setData(dataRes);
  //       setMasterLeaves(masterRes);
  //     } catch (err) {
  //       message.error("ไม่สามารถดึงข้อมูลได้");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchAll();
  // }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [dataRes, masterRes] = await Promise.all([
        intraAuthService.getDataLeaveQuery(),
        intraAuthService.getMasterLeaveQuery(),
      ]);
      const userId = session?.user?.userId;
      const byUserId = await intraAuthService.getDataLeaveByUserId(
        userId || ""
      );
      const user = await intraAuthService.getUserQuery();
      setUser(user);
      setLeaveByUserId(byUserId);
      setData(dataRes);
      setMasterLeaves(masterRes);
    } catch (err) {
      message.error("ไม่สามารถดึงข้อมูลได้");
    } finally {
      setLoading(false);
    }
  }, [intraAuthService, setLoading]);

  useEffect(() => {
    if (loading) {
      fetchData();
    }
  }, [loading, fetchData]);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `ยื่นใบลา`,
      children: (
        <Card>
          <LeaveBookingForm
            loading={loading}
            setLoading={setLoading}
            createDataLeave={intraAuthService.createDataLeave}
            masterLeaves={masterLeaves}
            leaveByUserId={leaveByUserId}
            user={user}
            fetchData={fetchData}
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
