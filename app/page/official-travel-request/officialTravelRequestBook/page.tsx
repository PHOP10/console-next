"use client";

import React from "react";
import { Card, Col, Row, Tabs, TabsProps } from "antd";
import OfficialTravelRequestBookForm from "../components/officialTravelRequestBookForm";

export default function Page() {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ยื่นคำขอเดินทางไปราชการ",
      children: (
        <Card>
          <OfficialTravelRequestBookForm />
        </Card>
      ),
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Tabs defaultActiveKey="1" items={items} />
      </Col>
    </Row>
  );
}
