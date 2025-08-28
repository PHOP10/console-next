"use client";

import React from "react";
import { Tabs, Breadcrumb, Row, Col, Divider } from "antd";
import type { TabsProps } from "antd";
import MaMedicalEquipmentTable from "../components/maMedicalEquipmentTable";

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "ข้อมูลเครื่องมือแพทย์",
    children: <MaMedicalEquipmentTable />,
  },
];

export default function Page() {
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
