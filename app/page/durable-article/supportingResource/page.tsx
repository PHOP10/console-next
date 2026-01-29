"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Breadcrumb,
  Card,
  Col,
  Divider,
  message,
  Row,
  Tabs,
  TabsProps,
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";
import { DurableArticleType } from "../../common";
import SupportingResourceForm from "../components/supportingResourceForm";
import SupportingResourceTable from "../components/supportingResourceTable";
import { useSession } from "next-auth/react";

export default function Page() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);
  const [data, setData] = useState<DurableArticleType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { data: session } = useSession();

  const fetchData = useCallback(async () => {
    try {
      const result = await intraAuthService.getDurableArticleQuery();

      let articles: any[] = [];

      if (Array.isArray(result)) {
        articles = result.filter((item) => item.type === "supportingResource");
      } else if (Array.isArray(result?.data)) {
        articles = result.data.filter(
          (item: any) => item.type === "supportingResource",
        );
      }
      setData(articles);
      // console.log();
    } catch (error) {
      console.error("Failed to fetch data:", error);
      message.error("ไม่สามารถดึงข้อมูลครุภัณฑ์ได้");
    } finally {
      setLoading(false);
    }
  }, [intraAuthService, setLoading]);

  useEffect(() => {
    if (loading) {
      fetchData();
    }
  }, [loading, fetchData]);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลวัสดุสนับสนุน",
      children: (
        <SupportingResourceTable
          setLoading={setLoading}
          loading={loading}
          data={data}
        />
      ),
    },
  ];

  if (session?.user?.role === "asset" || session?.user?.role === "admin") {
    items.push({
      key: "2",
      label: "เพิ่มวัสดุสนับสนุน",
      children: (
        <Card
          className="shadow-sm rounded-2xl border-gray-100 overflow-hidden"
        >
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
            เพิ่มวัสดุสนับสนุน
          </div>

          {/* 🔹 ตัวฟอร์มต้นฉบับ */}
          <SupportingResourceForm
            setLoading={setLoading}
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
