"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import MaCarBookForm from "../components/maCarBookForm";
import { MasterCarType } from "../../common";

export default function MaCarPage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);
  const [loading, setLoading] = useState<boolean>(false);
  const [cars, setCars] = useState<MasterCarType[]>([]);
  const [dataUser, setDataUser] = useState<any[]>([]);

  // โหลดข้อมูลรถและผู้ใช้
  const fetchCarsAndUsers = async () => {
    setLoading(true);
    try {
      const resCars = await intraAuthService.getMasterCarQuery();
      const resUsers = await intraAuthService.getUserQuery();
      setCars(resCars);
      setDataUser(resUsers);
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถดึงข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarsAndUsers();
  }, []);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ยื่นแบบฟอร์ม",
      children: (
        <Card>
          <MaCarBookForm cars={cars} dataUser={dataUser} loading={loading} />
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
