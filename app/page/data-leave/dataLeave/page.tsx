"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveType } from "../../common";
import { DataLeaveService } from "../services/dataLeave.service";
import DataLeaveTable from "../components/dataLeaveTable";
import DataLeaveCalendar from "../components/dataLeaveCalendar";

export default function DataLeavePage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<DataLeaveType[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await intraAuthService.getDataLeaveQuery();
      setData(res);
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
      label: `ข้อมูลการลา`,
      children: (
        <Card>
          <DataLeaveTable
            data={data}
            loading={loading}
            setLoading={setLoading}
          />
        </Card>
      ),
    },
    {
      key: "2",
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
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Tabs defaultActiveKey="1" items={items} />
      </Col>
    </Row>
  );
}
