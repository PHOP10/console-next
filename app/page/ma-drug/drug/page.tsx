"use client";

import React, { useState, useEffect } from "react";
import { Breadcrumb, Col, Divider, message, Row, Tabs, TabsProps } from "antd";
import DataDrugTable from "../components/drugTable";
import DataDrugForm from "../components/drugForm";
import DrugTypeTable from "../components/drugTypeTable";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType } from "../../common";

export default function Page() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<DrugType[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await intraAuthService.getDrugQuery();
      setData(Array.isArray(result) ? result : result?.data || []);
    } catch (error) {
      console.error("โหลดข้อมูลยาไม่สำเร็จ:", error);
      message.error("ไม่สามารถดึงข้อมูลยาได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // ตัวอย่างการโหลดข้อมูล
    setLoading(false);
  }, []);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลยา",
      children: (
        <DataDrugTable
          setLoading={setLoading}
          loading={loading}
          data={data}
          setData={setData}
        />
      ),
    },
    {
      key: "2",
      label: "เพิ่มยา",
      children: (
        <DataDrugForm
          setLoading={setLoading}
          loading={loading}
          setData={setData}
        />
      ),
    },
    { key: "3", label: "ประเภทยา", children: <DrugTypeTable /> },
  ];

  return (
    <div>
      <Breadcrumb items={[{ title: "หน้าหลัก" }, { title: "ข้อมูลยา" }]} />
      <Divider />
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Tabs defaultActiveKey="1" items={items} />
        </Col>
      </Row>
    </div>
  );
}
