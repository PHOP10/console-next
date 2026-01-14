"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import MaCarBookForm from "../components/maCarBookForm";
import { MaCarType, MasterCarType } from "../../common";
import { useSession } from "next-auth/react";

export default function MaCarPage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);
  const [loading, setLoading] = useState<boolean>(false);
  const [cars, setCars] = useState<MasterCarType[]>([]);
  const [dataUser, setDataUser] = useState<any[]>([]);
  const [maCarUser, setMaCarUser] = useState<MaCarType[]>([]);
  const [maCar, setMaCar] = useState<MaCarType[]>([]);

  const { data: session } = useSession();

  // โหลดข้อมูลรถและผู้ใช้
  const fetchData = async () => {
    setLoading(true);
    try {
      const resCars = await intraAuthService.getMasterCarQuery();
      const resMaCar = await intraAuthService.getMaCarQuery();
      const resUsers = await intraAuthService.getUserQuery();

      const resMaCarUser = resMaCar.filter(
        (car: any) => car.createdById === session?.user?.userId
      );
      setMaCar(resMaCar);
      setCars(resCars);
      setDataUser(resUsers);
      setMaCarUser(resMaCarUser);
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถดึงข้อมูลได้");
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
      label: "ฟอร์มจองรถ",
      children: (
        <Card>
          <MaCarBookForm
            cars={cars}
            dataUser={dataUser}
            loading={loading}
            fetchData={fetchData}
            maCarUser={maCarUser}
            maCar={maCar}
          />
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
