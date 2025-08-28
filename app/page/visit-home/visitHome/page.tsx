"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { visitHomeServices } from "../services/visitHome.service";
import VisitHomeForm from "../components/visitHomeForm";
import { MasterPatientType, VisitHomeType } from "../../common";
import MasterPatientTable from "../components/masterPatientTable";

export default function VisitHomePage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = visitHomeServices(intraAuth);

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<VisitHomeType[]>([]);
  const [dataMasterPatient, setDataMasterPatient] = useState<
    MasterPatientType[]
  >([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await intraAuthService.getVisitHomeQuery();
      const dataMasterPatients = await intraAuthService.getMasterPatientQuery();

      setData(res.data);
      setDataMasterPatient(dataMasterPatients);
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
      label: `การเยี่ยมบ้าน`,
      children: (
        <Card>
          <VisitHomeForm />
        </Card>
      ),
    },
    {
      key: "2",
      label: `ประเภทผู้ป่วย`,
      children: (
        <Card>
          <MasterPatientTable
            dataMasterPatient={dataMasterPatient}
            setDataMasterPatient={setDataMasterPatient}
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
