"use client";

import React, { useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useSWR from "swr";

// Components
import DrugDaisbursementTable from "../components/maDrugTable";
import MaDrugForm from "../components/maDrugForm";
import DispenseForm from "../components/dispenseForm";
import DispenseTable from "../components/dispenseTable"; // ✅ เปลี่ยนชื่อ import ให้สื่อความหมาย (เดิม DispenseType)

// Services & Hooks
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";

// Types
import { DrugType, MaDrugType, DispenseType } from "../../common";

export default function Page() {
  const intraAuth = useAxiosAuth();
  const [manualLoading, setManualLoading] = useState<boolean>(false);

  // 1. ปรับ Fetcher ให้ดึงข้อมูล 3 ส่วน: ยา (Master), ใบเบิก (Stock In), ใบจ่าย (Stock Out)
  const fetcher = async () => {
    const intraAuthService = MaDrug(intraAuth);

    const [drugsRes, maDrugsRes, dispenseRes] = await Promise.all([
      intraAuthService.getDrugQuery?.(),
      intraAuthService.getMaDrugQuery(),
      intraAuthService.getDispenseQuery(),
    ]);

    return {
      drugs: Array.isArray(drugsRes) ? drugsRes : drugsRes?.data || [],
      maDrugs: Array.isArray(maDrugsRes) ? maDrugsRes : maDrugsRes?.data || [],
      dispenses: Array.isArray(dispenseRes)
        ? dispenseRes
        : dispenseRes?.data || [], // ✅ เก็บข้อมูลจ่ายยา
    };
  };

  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR("maDrugDisbursementPage", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    onError: (error) => {
      console.error(error);
      message.error("ไม่สามารถดึงข้อมูลได้");
    },
  });

  // 2. แยกข้อมูลออกมาใช้งาน
  const drugs: DrugType[] = swrData?.drugs || [];
  const maDrugData: MaDrugType[] = swrData?.maDrugs || [];
  const dispenseData: DispenseType[] = swrData?.dispenses || [];

  const fetchDrugs = async () => {
    setManualLoading(true);
    await mutate(); // รีโหลดข้อมูลทั้งหมดใหม่
    setManualLoading(false);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลการเบิกยา",
      children: (
        <Card bordered={false} className="shadow-sm">
          <DrugDaisbursementTable data={maDrugData} fetchDrugs={fetchDrugs} />
        </Card>
      ),
    },
    {
      key: "2",
      label: "การเบิกยา",
      children: (
        <Card>
          <MaDrugForm
            drugs={drugs}
            data={maDrugData}
            refreshData={fetchDrugs}
          />
        </Card>
      ),
    },
    {
      key: "3",
      label: "ข้อมูลการจ่ายยา",
      children: (
        <Card bordered={false} className="shadow-sm">
          <DispenseTable
            data={dispenseData}
            refreshData={fetchDrugs}
            drugs={drugs}
          />
        </Card>
      ),
    },
    {
      key: "4",
      label: "การจ่ายยา",
      children: (
        <Card>
          <DispenseForm
            drugs={drugs}
            data={dispenseData}
            refreshData={fetchDrugs}
          />
        </Card>
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
