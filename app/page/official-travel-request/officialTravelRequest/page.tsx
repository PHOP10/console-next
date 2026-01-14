"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";
import OfficialTravelRequestTable from "../components/officialTravelRequestTable";
import OfficialTravelRequestCalendar from "../components/officialTravelRequestCalendar";
import { userService } from "../../user/services/user.service";
import { MasterCarType, UserType } from "../../common";
import { maCarService } from "../../ma-car/services/maCar.service";

export default function page() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = officialTravelRequestService(intraAuth);
  const intraAuthUserService = userService(intraAuth);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const intraAuthCarService = maCarService(intraAuth);
  const [dataUser, setDataUser] = useState<UserType[]>([]);
  const [cars, setCars] = useState<MasterCarType[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await intraAuthService.getOfficialTravelRequestQuery();
      const resUsers = await intraAuthUserService.getUserQuery();
      const resCar = await intraAuthCarService.getMasterCarQuery();
      setCars(resCar);
      setData(res);
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
      label: "ข้อมูลปฏิทินคำขอไปราชการ",
      children: (
        <Card>
          <OfficialTravelRequestCalendar
            data={data}
            loading={loading}
            fetchData={fetchData}
            dataUser={dataUser}
          />
        </Card>
      ),
    },
    {
      key: "2",
      label: "ข้อมูลตารางคำขอไปราชการ",
      children: (
        <Card>
          <OfficialTravelRequestTable
            data={data}
            loading={loading}
            fetchData={fetchData}
            dataUser={dataUser}
            cars={cars}
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
