"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";
import ManageOfficialTravelRequestTable from "../components/manageOfficialTravelRequestTable";

export default function page() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = officialTravelRequestService(intraAuth);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await intraAuthService.getOfficialTravelRequestQuery();
      setData(res);
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถดึงข้อมูลรถได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลขอเดินทางไปราชการ",
      children: (
        <Card>
          <ManageOfficialTravelRequestTable
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
