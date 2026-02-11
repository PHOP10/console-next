"use client";

import React, { useState, useEffect } from "react";
import { Card, Col, message, Row, Tabs, TabsProps } from "antd";
import DataDrugTable from "../components/drugTable";
import DataDrugForm from "../components/drugForm";
import DrugTypeTable from "../components/drugTypeTable";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType } from "../../common";
import useSWR from "swr"; // 1. Import SWR

export default function Page() {
  const intraAuth = useAxiosAuth();
  const [manualLoading, setManualLoading] = useState<boolean>(false);
  const [data, setData] = useState<DrugType[]>([]);
  const fetcher = async () => {
    const intraAuthService = MaDrug(intraAuth);
    const result = await intraAuthService.getDrugQuery();
    return Array.isArray(result) ? result : result?.data || [];
  };

  // 5. เรียกใช้ SWR
  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR("drugDataPage", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    onError: (error) => {
      console.error("โหลดข้อมูลยาไม่สำเร็จ:", error);
      message.error("ไม่สามารถดึงข้อมูลยาได้");
    },
  });

  useEffect(() => {
    if (swrData) {
      setData(swrData);
    }
  }, [swrData]);

  // รวม Loading state
  const loading = isSwrLoading || manualLoading;

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลยา",
      children: (
        <Card>
          <DataDrugTable
            setLoading={setManualLoading}
            loading={loading}
            data={data}
            setData={setData}
          />
        </Card>
      ),
    },
    {
      key: "2",
      label: "เพิ่มยา",
      children: (
        <Card>
          <DataDrugForm
            setLoading={setManualLoading}
            loading={loading}
            setData={setData}
          />
        </Card>
      ),
    },
    { key: "3", label: "ประเภทยา", children: <DrugTypeTable /> },
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
