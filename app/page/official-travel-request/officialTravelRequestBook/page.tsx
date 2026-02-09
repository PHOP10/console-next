"use client";

import React, { useState } from "react";
import { Card, Col, message, Row, Tabs, TabsProps } from "antd";
import OfficialTravelRequestBookForm from "../components/officialTravelRequestBookForm";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../../user/services/user.service";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";
import { maCarService } from "../../ma-car/services/maCar.service";
import {
  MaCarType,
  MasterCarType,
  OfficialTravelRequestType,
  UserType,
} from "../../common";
import { useSession } from "next-auth/react";
import useSWR from "swr"; // 1. Import SWR

export default function Page() {
  const intraAuth = useAxiosAuth();
  const { data: session } = useSession();

  // 2. สร้าง Fetcher
  const fetcher = async () => {
    const intraAuthService = officialTravelRequestService(intraAuth);
    const intraAuthUserService = userService(intraAuth);
    const intraAuthCarService = maCarService(intraAuth);

    // ดึงข้อมูลพร้อมกัน 3 API
    const [resUsers, resCars, resMaCars, resOTR] = await Promise.all([
      intraAuthUserService.getUserQuery(),
      intraAuthCarService.getMasterCarQuery(),
      intraAuthCarService.getMaCarQuery(),
      intraAuthService.getOfficialTravelRequestQuery(),
    ]);

    // กรองข้อมูลเฉพาะของ User ปัจจุบัน (ไม่ต้องยิง API ซ้ำ)
    const myOTR = resOTR.filter(
      (item: any) => item.createdById === session?.user?.userId,
    );

    return {
      users: resUsers,
      cars: resCars,
      maCars: resMaCars,
      dataOTR: resOTR,
      oTRUser: myOTR,
    };
  };

  // 3. เรียกใช้ SWR
  const { data: swrData } = useSWR(
    session?.user?.userId
      ? ["officialTravelRequestBookPage", session.user.userId]
      : null,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      onError: (err) => {
        console.error(err);
        message.error("ไม่สามารถดึงข้อมูลได้");
      },
    },
  );

  const dataUser: UserType[] = swrData?.users || [];
  const cars: MasterCarType[] = swrData?.cars || [];
  const maCars: MaCarType[] = swrData?.maCars || [];
  const dataOTR: OfficialTravelRequestType[] = swrData?.dataOTR || [];
  const oTRUser: OfficialTravelRequestType[] = swrData?.oTRUser || [];

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "ขอไปราชการ",
      children: (
        <Card>
          <div
            style={{
              textAlign: "center",
              color: "#0683e9",
              fontWeight: "bold",
              fontSize: "24px",
              marginTop: "-8px",
              marginBottom: "15px",
            }}
          >
            แบบฟอร์มขอไปราชการ
          </div>

          <OfficialTravelRequestBookForm
            dataUser={dataUser}
            cars={cars}
            oTRUser={oTRUser}
            dataOTR={dataOTR}
            maCars={maCars}
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
