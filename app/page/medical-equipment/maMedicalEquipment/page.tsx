"use client";

import React, { useEffect, useState } from "react";
import { Tabs, Row, Col } from "antd";
import type { TabsProps } from "antd";
import MaMedicalEquipmentTable from "../components/maMedicalEquipmentTable";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import { MaMedicalEquipmentType, MedicalEquipmentType } from "../../common";
import useSWR from "swr";

export default function Page() {
  const intraAuth = useAxiosAuth();
  const [manualLoading, setManualLoading] = useState(false);

  const fetcher = async () => {
    const intraAuthService = maMedicalEquipmentServices(intraAuth);
    const [result, res] = await Promise.all([
      intraAuthService.getMaMedicalEquipmentQuery(),
      intraAuthService.getMedicalEquipmentQuery(),
    ]);

    return {
      data: result,
      dataEQ: res,
    };
  };

  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR("maMedicalEquipmentPage", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    onError: (error) => {
      console.error("Failed to fetch data:", error);
    },
  });

  useEffect(() => {
    if (manualLoading) {
      mutate().then(() => setManualLoading(false));
    }
  }, [manualLoading, mutate]);

  const data: MaMedicalEquipmentType[] = swrData?.data || [];
  const dataEQ: MedicalEquipmentType[] = swrData?.dataEQ || [];
  const loading = isSwrLoading || manualLoading;

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "จัดการข้อมูลการส่งเครื่องมือแพทย์",
      children: (
        <MaMedicalEquipmentTable
          setLoading={setManualLoading}
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
