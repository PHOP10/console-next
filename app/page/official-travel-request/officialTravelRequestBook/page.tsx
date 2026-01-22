"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, message, Row, Tabs, TabsProps } from "antd";
import OfficialTravelRequestBookForm from "../components/officialTravelRequestBookForm";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../../user/services/user.service";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";
import { maCarService } from "../../ma-car/services/maCar.service";
import {
  MasterCarType,
  OfficialTravelRequestType,
  UserType,
} from "../../common";
import { useSession } from "next-auth/react";

export default function Page() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = officialTravelRequestService(intraAuth);
  const intraAuthUserService = userService(intraAuth);
  const intraAuthCarService = maCarService(intraAuth);
  const [dataUser, setDataUser] = useState<UserType[]>([]);
  const [cars, setCars] = useState<MasterCarType[]>([]);
  const [oTRUser, setOTRUser] = useState<OfficialTravelRequestType[]>([]);
  const [dataOTR, setdataOTR] = useState<OfficialTravelRequestType[]>([]);

  const { data: session } = useSession();

  const fetchData = async () => {
    // setLoading(true);
    try {
      const resUsers = await intraAuthUserService.getUserQuery();
      const res = await intraAuthCarService.getMasterCarQuery();
      const ress = await intraAuthService.getOfficialTravelRequestQuery();
      const dataRes = await intraAuthService.getOfficialTravelRequestQuery();

      const dataOTRUser = ress.filter(
        (car: any) => car.createdById === session?.user?.userId,
      );
      setdataOTR(dataRes);
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

          <div
            style={{
              textAlign: "center",
              color: "#0683e9",
              fontWeight: "bold",
              fontSize: "20px",
              marginTop: "-8px", 
              
              marginBottom: "15px",
            }}
          >
            ฟอร์มขอไปราชการ
          </div>
          
          <OfficialTravelRequestBookForm
            dataUser={dataUser}
            cars={cars}
            oTRUser={oTRUser}
            dataOTR={dataOTR}
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
