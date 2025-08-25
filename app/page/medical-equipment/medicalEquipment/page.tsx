"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Tabs, Breadcrumb, Row, Col, Divider } from "antd";
import type { TabsProps } from "antd";
import MedicalEquipmentTable from "../components/medicalEquipmentTable";
import {
  MaMedicalEquipmentType,
  MedicalEquipmentType,
} from "../../common/index";
import CreateMedicalEquipmentForm from "../components/medicalEquipmentForm";
import EquipmentTable from "../components/equipmentTable";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import { useSession } from "next-auth/react";

export default function Page() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maMedicalEquipmentServices(intraAuth);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<MaMedicalEquipmentType[]>([]);
  const [dataEQ, setDataRQ] = useState<MedicalEquipmentType[]>([]);
  const { data: session } = useSession();

  const fetchData = useCallback(async () => {
    try {
      const data = await intraAuthService.getMaMedicalEquipmentQuery();
      const res = await intraAuthService.getMedicalEquipmentQuery();
      setData(data);
      setDataRQ(res);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [intraAuthService, setLoading]);

  useEffect(() => {
    // console.log(data);
    if (loading) {
      fetchData();
    }
  }, [loading, fetchData]);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลเครื่องมือแพทย์",
      children: (
        <MedicalEquipmentTable
          setLoading={setLoading}
          loading={loading}
          data={data}
          dataEQ={dataEQ}
        />
      ),
    },
    {
      key: "2",
      label: "ส่งเครื่องมือแพทย์",
      children: (
        <CreateMedicalEquipmentForm
          setLoading={setLoading}
          dataEQ={dataEQ}
          data={data}
        />
      ),
    },
    {
      key: "3",
      label: "ข้อมูลเครื่องมือแพทย์ทั้งหมด",
      children: (
        <EquipmentTable
          setLoading={setLoading}
          loading={loading}
          dataEQ={dataEQ}
          fetchData={fetchData}
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
