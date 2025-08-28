"use client";

import React, { useState } from "react";
import { Breadcrumb, Col, Divider, Row, Tabs, TabsProps } from "antd";
import SupportingResourceTable from "../components/supportingResourceTable";
import SupportingResourceForm from "../components/supportingResourceForm";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลวัสดุสนับสนุน",
      children: (
        <SupportingResourceTable setLoading={setLoading} loading={loading} />
      ),
    },
    {
      key: "2",
      label: "เพิ่มวัสดุสนับสนุน",
      children: (
        <SupportingResourceForm setLoading={setLoading} loading={loading} />
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
