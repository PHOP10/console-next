"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import MaCarTable from "../components/maCarTable";
import MaCarCalendar from "../components/maCarCalendar";
import { useSession } from "next-auth/react";
import { userService } from "../../user/services/user.service";
import { MaCarType, MasterCarType, UserType } from "../../common";

export default function MaCarPage() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);
  const intraAuthUserService = userService(intraAuth);
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<MaCarType[]>([]);
  const [dataUser, setDataUser] = useState<UserType[]>([]);
  const [cars, setCars] = useState<MasterCarType[]>([]);
  const [maCarUser, setMaCarUser] = useState<MaCarType[]>([]);
  // ฟังก์ชันดึงข้อมูล
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await intraAuthService.getMaCarQuery();
      const resCars = await intraAuthService.getMasterCarQuery();
      const resUsers = await intraAuthUserService.getUserQuery();
      const resMaCar = await intraAuthService.getMaCarQuery();
      const resMaCarUser = resMaCar.filter(
        (car: any) => car.createdById === session?.user?.userId
      );
      // console.log("maCarUser", maCarUser);
      setData(res);
      setCars(resCars);
      setMaCarUser(resMaCarUser);
      setDataUser(resUsers);
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
          <MaCarCalendar
            data={data}
            loading={loading}
            fetchData={fetchData}
            cars={cars}
            dataUser={dataUser}
          />
        </Card>
      ),
    },
    {
      key: "2",
      label: "ข้อมูลตารางการจองรถ",
      children: (
        <Card>
          <MaCarTable
            data={data}
            loading={loading}
            fetchData={fetchData}
            dataUser={dataUser}
            cars={cars}
            maCarUser={maCarUser}
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
