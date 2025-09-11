"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Tabs, Breadcrumb, Row, Col, Divider } from "antd";
import type { TabsProps } from "antd";
import MaMedicalEquipmentTable from "../components/maMedicalEquipmentTable";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import { MaMedicalEquipmentType, MedicalEquipmentType } from "../../common";

export default function Page() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maMedicalEquipmentServices(intraAuth);
  const [data, setData] = useState<MaMedicalEquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataEQ, setDataRQ] = useState<MedicalEquipmentType[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const result = await intraAuthService.getMaMedicalEquipmentQuery();
      const res = await intraAuthService.getMedicalEquipmentQuery();

      setDataRQ(res);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch data:", error);
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
      label: "จัดการข้อมูลการส่งเครื่องมือแพทย์",
      children: (
        <MaMedicalEquipmentTable
          setLoading={setLoading}
          loading={loading}
          data={data}
          dataEQ={dataEQ}
        />
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Tabs defaultActiveKey="1" items={items} />
        </Col>
      </Row>
    </div>
  );
}
