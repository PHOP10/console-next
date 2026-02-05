"use client";

import React, { useState } from "react";
import { Card, Col, Row, Tabs, TabsProps, message } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";
import OfficialTravelRequestTable from "../components/officialTravelRequestTable";
import OfficialTravelRequestCalendar from "../components/officialTravelRequestCalendar";
import { userService } from "../../user/services/user.service";
import { MasterCarType, UserType } from "../../common";
import { maCarService } from "../../ma-car/services/maCar.service";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";

export default function page() {
  const intraAuth = useAxiosAuth();
  const [manualLoading, setManualLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const activeTabKey = searchParams.get("tab") || "1";

  const fetcher = async () => {
    const intraAuthService = officialTravelRequestService(intraAuth);
    const intraAuthUserService = userService(intraAuth);
    const intraAuthCarService = maCarService(intraAuth);

    const [res, resUsers, resCar] = await Promise.all([
      intraAuthService.getOfficialTravelRequestQuery(),
      intraAuthUserService.getUserQuery(),
      intraAuthCarService.getMasterCarQuery(),
    ]);

    return {
      data: res,
      dataUser: resUsers,
      cars: resCar,
    };
  };

  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR("officialTravelRequestPage", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    onError: () => {
      message.error("ไม่สามารถดึงข้อมูลรถได้");
    },
  });

  const data: any[] = swrData?.data || [];
  const dataUser: UserType[] = swrData?.dataUser || [];
  const cars: MasterCarType[] = swrData?.cars || [];

  const loading = isSwrLoading || manualLoading;

  const fetchData = async () => {
    setManualLoading(true);
    await mutate();
    setManualLoading(false);
  };

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
        <Tabs defaultActiveKey={activeTabKey} items={items} />
      </Col>
    </Row>
  );
}
