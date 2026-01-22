"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { visitHomeServices } from "../services/visitHome.service";
import VisitHomeTable from "../components/visitHomeTable";
import { MasterPatientType, VisitHomeType } from "../../common";

export default function VisitHomePage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = visitHomeServices(intraAuth);

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<VisitHomeType[]>([]);
  const [masterPatients, setMasterPatients] = useState<MasterPatientType[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await intraAuthService.getVisitHomeQuery();
      const ress = await intraAuthService.getMasterPatientQuery();
      setMasterPatients(ress);
      setData(res);
    } catch (err) {
      message.error("ไม่สามารถดึงข้อมูลการเยี่ยมบ้านได้");
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
      label: `ข้อมูลการเยี่ยมบ้าน`,
      children: (
  
          <VisitHomeTable
            data={data}
            loading={loading}
            setLoading={setLoading}
            fetchData={fetchData}
            masterPatients={masterPatients}
          />
      
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
