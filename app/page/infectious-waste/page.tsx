"use client";

import { Card, Col, Row, TabsProps, Tabs, message } from "antd";
import { useState } from "react";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "./services/infectiouswaste.service";
import { InfectiousWasteType } from "./../common/index";
import ThrowAwayWaste from "./components/throwAwayWasteForm";
import InfectiousWasteChart from "./components/infectiousWasteChart";
import ThrowAwayWasteTable from "./components/throwAwayWasteTable";
import useSWR from "swr"; // 1. Import SWR

export default function Page() {
  const intraAuth = useAxiosAuth();

  // 2. แยก manualLoading สำหรับการกดปุ่มต่างๆ (เช่น บันทึก/ลบ)
  const [manualLoading, setManualLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("1");

  // 3. สร้าง Fetcher Function
  const fetcher = async () => {
    const intraAuthService = infectiousWasteServices(intraAuth);
    return await intraAuthService.getInfectiousWasteQuery();
  };

  // 4. เรียกใช้ SWR
  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR("infectiousWastePage", fetcher, {
    refreshInterval: 5000, // อัปเดตข้อมูลทุก 5 วินาที
    revalidateOnFocus: true,
    onError: (error) => {
      console.error("Failed to fetch data:", error);
      // message.error("ไม่สามารถดึงข้อมูลได้"); // เลือกเปิดได้ตามต้องการ
    },
  });

  // 5. Map ข้อมูล (ใช้ Array ว่างเป็น Default)
  const dataInfectiousWaste: InfectiousWasteType[] = swrData || [];

  // รวม Loading state
  const loading = isSwrLoading || manualLoading;

  // 6. Wrapper function สำหรับส่งให้ลูก (เพื่อให้ Type ตรงกับ Promise<void> และจัดการ Loading Manual)
  const fetchData = async () => {
    setManualLoading(true);
    await mutate();
    setManualLoading(false);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `ข้อมูลขยะติดเชื้อ`,
      children: (
        <ThrowAwayWasteTable
          data={dataInfectiousWaste}
          loading={loading}
          setLoading={setManualLoading}
          fetchData={fetchData}
        />
      ),
    },
    {
      key: "2",
      label: `กราฟขยะติดเชื้อ`,
      children: <InfectiousWasteChart data={dataInfectiousWaste} />,
    },
    {
      key: "3",
      label: `ทิ้งขยะติดเชื้อ`,
      children: (
        <Card>
          <div
            style={{
              textAlign: "center",
              color: "#0683e9",
              fontWeight: "bold",
              fontSize: "24px",
              marginTop: "-8px",
              marginBottom: "15px",
            }}
          >
            แบบฟอร์มบันทึกการทิ้งขยะติดเชื้อ
          </div>

          <ThrowAwayWaste setLoading={setManualLoading} fetchData={fetchData} />
        </Card>
      ),
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
