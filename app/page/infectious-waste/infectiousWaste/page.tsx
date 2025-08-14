"use client";

import {
  Breadcrumb,
  Card,
  Col,
  Row,
  TabsProps,
  Tabs,
  Divider,
  Table,
  Button,
  Popconfirm,
  message,
} from "antd";
import { useEffect, useState, useCallback } from "react";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/infectiouswaste.service";
import { InfectiousWasteType } from "../../common/index";
import type { ColumnsType } from "antd/es/table";
import ThrowAwayWaste from "../components/throwAwayWasteForm";
import InfectiousWasteChart from "../components/infectiousWasteChart";

export default function Page() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);

  const [dataInfectiousWaste, setDataInfectiousWaste] = useState<
    InfectiousWasteType[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("1");

  const fetchData = useCallback(async () => {
    try {
      const data = await intraAuthService.getInfectiousWasteQuery();
      setDataInfectiousWaste(data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [intraAuthService]);

  useEffect(() => {
    if (loading) {
      fetchData();
    }
  }, [loading, fetchData]);

  const columns: ColumnsType<InfectiousWasteType> = [
    {
      title: "ประเภทขยะ",
      dataIndex: "wasteType",
      key: "wasteType",
    },
    {
      title: "น้ำหนัก (กิโลกรัม)",
      dataIndex: "wasteWeight",
      key: "wasteWeight",
    },
    {
      title: "วันที่ทิ้ง",
      dataIndex: "discardedDate",
      key: "discardedDate",
      render: (date: string) => new Date(date).toLocaleDateString("th-TH"),
    },
    // {
    //   title: "วันที่กำจัด",
    //   dataIndex: "disposedDate",
    //   key: "disposedDate",
    //   render: (date: string | null) =>
    //     date ? new Date(date).toLocaleDateString("th-TH") : "ยังไม่กำจัด",
    // },
    {
      title: "การจัดการ",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="ยืนยันการลบ"
          description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
          onConfirm={async () => {
            try {
              await intraAuthService.deleteInfectiousWaste(record.id);
              message.success("ลบข้อมูลสำเร็จ");
              setLoading(true);
            } catch (error) {
              console.error("Error deleting waste:", error);
              message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
            }
          }}
          okText="ใช่"
          cancelText="ยกเลิก"
        >
          <Button danger size="small">
            ลบ
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `ข้อมูลขยะติดเชื้อ`,
      children: (
        <Card>
          <Table
            dataSource={dataInfectiousWaste}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ),
    },
    {
      key: "2",
      label: `ทิ้งขยะติดเชื้อ`,
      children: <ThrowAwayWaste setLoading={setLoading} />,
    },
    {
      key: "3",
      label: `กราฟขยะติดเชื้อ`,
      children: <InfectiousWasteChart data={dataInfectiousWaste} />,
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Tabs
            defaultActiveKey="1"
            items={items}
            onChange={(key) => setActiveTab(key)}
          />
        </Col>
      </Row>
    </div>
  );
}
