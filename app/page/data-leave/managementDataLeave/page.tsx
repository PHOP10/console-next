"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveType } from "../../common";
import { DataLeaveService } from "../services/dataLeave.service";
import ManagementDataLeaveTable from "../components/managementDataLeaveTable";

export default function managementDataLeavePage() {
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
      label: `จัดการข้อมูลการลา`,
      children: (
        <Card>
          <ManagementDataLeaveTable
            data={data}
            loading={loading}
            setLoading={setLoading}
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
