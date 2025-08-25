"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "./services/user.service";
import { UserType } from "../common";
import UserTable from "./components/userTable";
import UserForm from "./components/userForm";

export default function userPage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<UserType[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await intraAuthService.getUserQuery();
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
      label: "ข้อมูลผู้ใช้",
      children: (
        <Card>
          <UserTable
            data={data}
            loading={loading}
            fetchData={fetchData}
            setData={setData}
          />
        </Card>
      ),
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card>
          <Tabs defaultActiveKey="1" items={items} />
        </Card>
      </Col>
    </Row>
  );
}
