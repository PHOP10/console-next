"use client";

import React, { useState, useEffect } from "react";
import { Breadcrumb, Col, Divider, Row, Tabs, TabsProps } from "antd";
import DurableArticleTable from "../components/durableArticleTable";
import DurableArticleForm from "../components/durableArticleForm";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // ตัวอย่างการโหลดข้อมูล
    setLoading(false);
  }, []);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลครุภัณฑ์",
      children: (
        <DurableArticleTable setLoading={setLoading} loading={loading} />
      ),
    },
    {
      key: "2",
      label: "เพิ่มครุภัณฑ์",
      children: (
        <DurableArticleForm setLoading={setLoading} loading={loading} />
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
