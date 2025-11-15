"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, message, Row, Tabs, TabsProps } from "antd";
import OfficialTravelRequestBookForm from "../components/officialTravelRequestBookForm";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../../user/services/user.service";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";
import { maCarService } from "../../ma-car/services/maCar.service";
import { MasterCarType, UserType } from "../../common";
import { useSession } from "next-auth/react";

export default function Page() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = officialTravelRequestService(intraAuth);
  const intraAuthUserService = userService(intraAuth);
  const intraAuthCarService = maCarService(intraAuth);
  const [dataUser, setDataUser] = useState<UserType[]>([]);
  const [cars, setCars] = useState<MasterCarType[]>([]);
  const [oTRUser, setOTRUser] = useState<MasterCarType[]>([]);
  const { data: session } = useSession();

  const fetchData = async () => {
    // setLoading(true);
    try {
      const resUsers = await intraAuthUserService.getUserQuery();
      const res = await intraAuthCarService.getMasterCarQuery();
      const ress = await intraAuthService.getOfficialTravelRequestQuery();

      const dataOTRUser = ress.filter(
        (car: any) => car.createdById === session?.user?.userId
      );
      
      setCars(res);
      setDataUser(resUsers);
      setOTRUser(dataOTRUser);
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถดึงข้อมูลได้");
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ฟอร์มคำขอไปราชการ",
      children: (
        <Card>
          <OfficialTravelRequestBookForm
            dataUser={dataUser}
            cars={cars}
            oTRUser={oTRUser}
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
