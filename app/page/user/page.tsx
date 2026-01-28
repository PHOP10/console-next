"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "./services/user.service";
import UserTable from "./components/userTable";
import UserProfile from "./components/UserProfile";
import useSWR from "swr";

export default function UserPage() {
  const { data: session } = useSession();
  const intraAuth = useAxiosAuth();
  const [manualLoading, setManualLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);

  const fetcher = async () => {
    const intraAuthService = userService(intraAuth);
    return await intraAuthService.getUserQuery();
  };

  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR(session?.user?.role === "admin" ? "userPage" : null, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    onError: () => {
      message.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
    },
  });

  useEffect(() => {
    if (swrData) {
      setData(swrData);
    }
  }, [swrData]);

  const fetchData = async () => {
    setManualLoading(true);
    await mutate();
    setManualLoading(false);
  };

  const loading = isSwrLoading || manualLoading;

  const items: TabsProps["items"] = [];

  if (session?.user?.role === "admin") {
    items.push({
      key: "1",
      label: "ข้อมูลผู้ใช้",
      children: (
        <Card bordered={false} bodyStyle={{ padding: 0 }}>
          <UserTable
            data={data}
            loading={loading}
            fetchData={fetchData}
            setData={setData}
          />
        </Card>
      ),
    });
  }

  items.push({
    key: "2",
    label: "โปรไฟล์",
    children: (
      <div style={{ backgroundColor: "#fff", minHeight: "100%" }}>
        <UserProfile />
      </div>
    ),
  });

  if (!session) return null;

  return (
    <Row>
      <Col span={24}>
        <Card
          bordered={false}
          bodyStyle={{ padding: 0 }}
          style={{
            backgroundColor: "transparent",
            border: "none",
            boxShadow: "none",
          }}
        >
          <Tabs
            defaultActiveKey={session?.user?.role === "admin" ? "1" : "2"}
            items={items}
          />
        </Card>
      </Col>
    </Row>
  );
}
