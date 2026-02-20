"use client";

import React, { useState, useEffect } from "react";
import { Card, Col, message, Row, Tabs, TabsProps } from "antd";
import DataDrugTable from "../components/drugTable";
import DataDrugForm from "../components/drugForm";
import DrugTypeTable from "../components/drugTypeTable";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType, MasterDrugType } from "../../common"; // ✅ อย่าลืม Import MasterDrugType
import useSWR from "swr";

export default function Page() {
  const intraAuth = useAxiosAuth();

  // ✅ ขยับ intraAuthService ออกมาประกาศตรงนี้ เพื่อให้ใช้ได้ทั้งใน fetcher และ useEffect
  const intraAuthService = MaDrug(intraAuth);

  const [manualLoading, setManualLoading] = useState<boolean>(false);
  const [data, setData] = useState<DrugType[]>([]);

  // ✅ เพิ่ม State สำหรับเก็บข้อมูล Master Drugs
  const [masterDrugs, setMasterDrugs] = useState<MasterDrugType[]>([]);

  const fetcher = async () => {
    const result = await intraAuthService.getDrugQuery();
    return Array.isArray(result) ? result : result?.data || [];
  };

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

  // ✅ เพิ่ม useEffect สำหรับดึงข้อมูล Master Drugs
  useEffect(() => {
    const fetchMasterDrugs = async () => {
      try {
        const res: MasterDrugType[] =
          await intraAuthService.getMasterDrugQuery();
        if (Array.isArray(res)) {
          setMasterDrugs(res);
        }
      } catch (error) {
        console.error("Failed to load master drugs", error);
      }
    };
    fetchMasterDrugs();
  }, []); // ทำงานแค่ครั้งเดียวตอนโหลดหน้า

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
            masterDrugs={masterDrugs} // ✅ ส่ง Prop ไปที่ Table
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
            masterDrugs={masterDrugs} // ✅ ส่ง Prop ไปที่ Form
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
