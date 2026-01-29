"use client";

import React, { useState } from "react";
import { Card, Col, message, Row, Tabs, TabsProps } from "antd";
// import DurableArticleTable from "../components/durableArticleTable";
// import DurableArticleForm from "../components/durableArticleForm";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
// import { infectiousWasteServices } from "../services/durableArticle.service";
import { DurableArticleType } from "../common/index";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { infectiousWasteServices } from "./services/durableArticle.service";
import DurableArticleTable from "./components/durableArticleTable";
import DurableArticleForm from "./components/durableArticleForm";

export default function Page() {
  const intraAuth = useAxiosAuth();
  const { data: session } = useSession();

  // แยก manualLoading สำหรับ Action ต่างๆ (เช่น กดบันทึก)
  const [manualLoading, setManualLoading] = useState<boolean>(false);

  // สร้าง Fetcher Function
  const fetcher = async () => {
    const intraAuthService = infectiousWasteServices(intraAuth);
    const result = await intraAuthService.getDurableArticleQuery();

    // Logic กรองข้อมูล (คงเดิมตามโค้ดเก่า)
    let articles: any[] = [];
    if (Array.isArray(result)) {
      articles = result.filter((item: any) => item.type === "durableArticles");
    } else if (Array.isArray(result?.data)) {
      articles = result.data.filter(
        (item: any) => item.type === "durableArticles",
      );
    }

    return articles;
  };

  // เรียกใช้ SWR
  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR("durableArticlePage", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    onError: (error) => {
      console.error("Failed to fetch data:", error);
      message.error("ไม่สามารถดึงข้อมูลครุภัณฑ์ได้");
    },
  });

  const data: DurableArticleType[] = swrData || [];
  const loading = isSwrLoading || manualLoading;

  // Wrapper function สำหรับส่งให้ลูก
  const fetchData = async () => {
    setManualLoading(true);
    await mutate();
    setManualLoading(false);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลครุภัณฑ์",
      children: (
        <DurableArticleTable
          setLoading={setManualLoading} // ใช้ manualLoading แทน
          loading={loading}
          data={data}
        />
      ),
    },
  ];

  if (session?.user?.role === "asset" || session?.user?.role === "admin") {
    items.push({
      key: "2",
      label: "เพิ่มครุภัณฑ์",
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
            แบบฟอร์มเพิ่มครุภัณฑ์
          </div>

          <DurableArticleForm
            setLoading={setManualLoading}
            loading={loading}
            fetchData={fetchData}
          />
        </Card>
      ),
    });
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Tabs defaultActiveKey="1" items={items} destroyInactiveTabPane />
        </Col>
      </Row>
    </div>
  );
}
