"use client";

import React, { useState, useEffect } from "react";
import { Breadcrumb, Col, Divider, Row, Tabs, TabsProps } from "antd";
import DrugDaisbursementForm from "../components/maDrugForm";
import DrugDaisbursementTable from "../components/maDrugTable";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลการเบิกจ่ายยา",
      children: <DrugDaisbursementTable />,
      // setLoading={setLoading} loading={loading} />
      // ),
    },
    {
      key: "2",
      label: "การเบิกจ่ายยา",
      children: <DrugDaisbursementForm />,
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
