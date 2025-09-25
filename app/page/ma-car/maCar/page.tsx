"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import MaCarTable from "../components/maCarTable";
import MaCarCalendar from "../components/maCarCalendar";
import { useSession } from "next-auth/react";

export default function MaCarPage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);

  // ฟังก์ชันดึงข้อมูล
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await intraAuthService.getMaCarQuery();
      setData(res);
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถดึงข้อมูลรถได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ข้อมูลปฏิทินรายการรถ",
      children: (
        <Card>
          <MaCarCalendar data={data} loading={loading} fetchData={fetchData} />
        </Card>
      ),
    },
    {
      key: "2",
      label: "ข้อมูลการจองรถ",
      children: (
        <Card>
          <MaCarTable data={data} loading={loading} fetchData={fetchData} />
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
