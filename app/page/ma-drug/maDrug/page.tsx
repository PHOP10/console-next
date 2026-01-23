"use client";

import React, { useState, useEffect } from "react";
import {
  Breadcrumb,
  Card,
  Col,
  Divider,
  Row,
  Tabs,
  TabsProps,
  message,
} from "antd";
import DrugDaisbursementTable from "../components/maDrugTable";
import MaDrugForm from "../components/maDrugForm";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType, MaDrugType } from "../../common";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);
  const [drugs, setDrugs] = useState<DrugType[]>([]);
  const [data, setData] = useState<MaDrugType[]>([]);
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  // ฟังก์ชันดึงรายการยา
  const fetchDrugs = async () => {
    try {
      const result = await intraAuthService.getDrugQuery?.();
      const results = await intraAuthService.getMaDrugQuery();
      setData(Array.isArray(results) ? results : results?.data || []);
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
      children: <DrugDaisbursementTable data={data} fetchDrugs={fetchDrugs} />,
    },
    {
      key: "2",
      label: "การเบิกจ่ายยา",
      children: (
        <>
          <Card>
            <div
              style={{
                textAlign: "center",
                color: "#0683e9",
                fontWeight: "bold",
                fontSize: "24px",
                marginTop: "-8px",
                marginBottom: "15px",
              }}
            >
              ใบเบิกจ่ายเวชภัณฑ์
            </div>

            <MaDrugForm drugs={drugs} refreshData={fetchDrugs} />
          </Card>
        </>
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
