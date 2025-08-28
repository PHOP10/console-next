"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Breadcrumb, Col, Divider, message, Row, Tabs, TabsProps } from "antd";
import DurableArticleTable from "../components/durableArticleTable";
import DurableArticleForm from "../components/durableArticleForm";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";
import { DurableArticleType } from "../../common";

export default function Page() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);

  const [data, setData] = useState<DurableArticleType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      const result = await intraAuthService.getDurableArticleQuery();
      if (Array.isArray(result)) {
        setData(result);
      } else if (Array.isArray(result?.data)) {
        setData(result.data);
      } else {
        setData([]);
      }
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
      label: "ข้อมูลครุภัณฑ์",
      children: (
        <DurableArticleTable
          setLoading={setLoading}
          loading={loading}
          data={data}
        />
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
          <Tabs defaultActiveKey="1" items={items} destroyInactiveTabPane />
        </Col>
      </Row>
    </div>
  );
}
