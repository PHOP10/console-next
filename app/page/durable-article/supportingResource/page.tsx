"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Breadcrumb, Col, Divider, message, Row, Tabs, TabsProps } from "antd";
import SupportingResourceTable from "../components/supportingResourceTable";
import SupportingResourceForm from "../components/supportingResourceForm";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";
import { SupportingResourceType } from "../../common";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);

  const [data, setData] = useState<SupportingResourceType[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<SupportingResourceType | null>(
    null
  );

  const fetchData = useCallback(async () => {
    try {
      const result = await intraAuthService.getSupportingResourceQuery();
      if (Array.isArray(result)) {
        setData(result);
      } else if (Array.isArray(result?.data)) {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Failed to fetch supporting resources:", error);
      message.error("ไม่สามารถดึงข้อมูลวัสดุสนับสนุนได้");
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
          fetchData={fetchData}
        />
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
          <Tabs defaultActiveKey="1" items={items} destroyInactiveTabPane />
        </Col>
      </Row>
    </div>
  );
}
