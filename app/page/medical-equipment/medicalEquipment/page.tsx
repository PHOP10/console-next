"use client";

import React, { useState, useEffect } from "react";
import { Tabs, Breadcrumb, Row, Col, Divider } from "antd";
import type { TabsProps } from "antd";
import MedicalEquipmentTable from "../components/medicalEquipmentTable";
import { MaMedicalEquipmentType } from "../../common/index";
import CreateMedicalEquipmentForm from "../components/medicalEquipmentForm";
import EquipmentTable from "../components/equipmentTable";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // ตัวอย่างการโหลดข้อมูล
    setLoading(false);
  }, []);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลเครื่องมือแพทย์",
      children: (
        <MedicalEquipmentTable setLoading={setLoading} loading={loading} />
      ),
    },
    {
      key: "2",
      label: "ส่งเครื่องมือแพทย์",
      children: <CreateMedicalEquipmentForm setLoading={setLoading} />,
    },
    {
      key: "3",
      label: "ข้อมูลเครื่องมือแพทย์ทั้งหมด",
      children: <EquipmentTable setLoading={setLoading} loading={loading} />,
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
