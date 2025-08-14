"use client";

import React, { useState, useEffect } from "react";
import { Breadcrumb, Col, Divider, Row, Tabs, TabsProps } from "antd";
import MaDrugDaisbursementTable from "../components/manageDrugTable";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // ตัวอย่างการโหลดข้อมูล
    setLoading(false);
  }, []);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "จัดการข้อมูลการเบิกจ่ายยา",
      children: (
        <MaDrugDaisbursementTable
        // setLoading={setLoading} loading={loading}
        />
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[{ title: "หน้าหลัก" }, { title: "จัดการบิกจ่ายยา" }]}
      />
      <Divider />
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Tabs defaultActiveKey="1" items={items} />
        </Col>
      </Row>
    </div>
  );
}
