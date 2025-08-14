"use client";

import React, { useState, useEffect } from "react";
import { Breadcrumb, Col, Divider, Row, Tabs, TabsProps } from "antd";
import DataDrugTable from "../components/drugTable";
import DataDrugForm from "../components/drugForm";
import DrugType from "../components/drugTypeTable";
import DrugTypeTable from "../components/drugTypeTable";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);

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
        // setLoading={setLoading} loading={loading}
        />
      ),
    },
    {
      key: "2",
      label: "เพิ่มยา",
      children: (
        <DataDrugForm
        // setLoading={setLoading} loading={loading}
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
