"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveType } from "../../common";
import { DataLeaveService } from "../services/dataLeave.service";
import LeaveBookingForm from "../components/leaveBookingForm";

export default function DataLeavePage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DataLeaveType[]>([]);

  //   const fetchData = useCallback(async () => {
  //     try {
  //       const res = await intraAuthService.getDataLeaveQuery();
  //       setData(res);
  //     } catch (err) {
  //       message.error("ไม่สามารถดึงข้อมูลการลาได้");
  //     }
  //   }, [intraAuthService]);

  //   useEffect(() => {
  //     fetchData();
  //   }, [fetchData]);

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
