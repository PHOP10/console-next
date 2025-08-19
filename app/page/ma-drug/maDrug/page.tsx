"use client";

import React, { useState, useEffect } from "react";
import { Breadcrumb, Col, Divider, Row, Tabs, TabsProps, message } from "antd";
import DrugDaisbursementTable from "../components/maDrugTable";
import MaDrugForm from "../components/maDrugForm";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType } from "../../common";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);
  const [drugs, setDrugs] = useState<DrugType[]>([]);

  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  // ฟังก์ชันดึงรายการยา
  const fetchDrugs = async () => {
    try {
      const result = await intraAuthService.getDrugQuery?.();
      setDrugs(Array.isArray(result) ? result : result?.data || []);
    } catch (error) {
      console.error(error);
      message.error("ไม่สามารถดึงข้อมูลยาได้");
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDrugs().finally(() => setLoading(false));
  }, []);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลการเบิกจ่ายยา",
      children: <DrugDaisbursementTable />,
    },
    {
      key: "2",
      label: "การเบิกจ่ายยา",
      children: <MaDrugForm drugs={drugs} refreshData={fetchDrugs} />, // ✅ ส่ง drugs + refreshData
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ title: "หน้าหลัก" }, { title: "เบิกจ่ายยา" }]} />
      <Divider />
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Tabs defaultActiveKey="1" items={items} />
        </Col>
      </Row>
    </div>
  );
}
