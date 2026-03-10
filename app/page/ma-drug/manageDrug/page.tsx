"use client";

import React, { useState, useEffect } from "react";
import { Card, Col, message, Row, Tabs, TabsProps } from "antd";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import MaDrugDaisbursementTable from "../components/manageDrugTable";
import MaDispenseTable from "../components/maDispenseTable";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { MaDrugType, DispenseType, DrugType, UserType } from "../../common";
import { userService } from "../../user/services/user.service";

export default function Page() {
  const intraAuth = useAxiosAuth();
  const { data: session } = useSession();
  const [manualLoading, setManualLoading] = useState<boolean>(false);
  const [drugs, setDrugsData] = useState<DrugType[]>([]);
  const [requestData, setRequestData] = useState<MaDrugType[]>([]);
  const [dispenseData, setDispenseData] = useState<DispenseType[]>([]);
  const intraAuthUserService = userService(intraAuth);
  const maDrugService = MaDrug(intraAuth);
  // 4. สร้าง Fetcher Function
  const fetcher = async () => {
    // ดึงข้อมูลพร้อมกัน
    const [drugsRes, requestsRes, dispensesRes, resUsers] = await Promise.all([
      maDrugService.getDrugQuery?.(),
      maDrugService.getMaDrugQuery(),
      maDrugService.getDispenseQuery(),
      intraAuthUserService.getUserQuery(),
    ]);

    return {
      drugs: Array.isArray(drugsRes) ? drugsRes : drugsRes?.data || [],
      requests: Array.isArray(requestsRes)
        ? requestsRes
        : requestsRes?.data || [],
      dispenses: Array.isArray(dispensesRes)
        ? dispensesRes
        : dispensesRes?.data || [],
      dataUser: resUsers,
    };
  };

  const {
    data: swrData,
    isLoading: isSwrLoading,
    mutate,
  } = useSWR("dashboardData", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    onError: (error) => {
      console.error("โหลดข้อมูลไม่สำเร็จ:", error);
      message.error("ไม่สามารถดึงข้อมูลได้");
    },
  });
  const dataUser: UserType[] = swrData?.dataUser || [];
  // 6. Sync ข้อมูลเข้า State
  useEffect(() => {
    if (swrData) {
      setDrugsData(swrData.drugs);
      setRequestData(swrData.requests);
      setDispenseData(swrData.dispenses);
    }
  }, [swrData]);

  const fetchData = async () => {
    setManualLoading(true);
    await mutate();
    setManualLoading(false);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "จัดการข้อมูลการเบิกยา",
      children: (
        <Card>
          <MaDrugDaisbursementTable
            data={requestData}
            fetchData={fetchData}
            setData={setRequestData}
            dataUser={dataUser}
          />
        </Card>
      ),
    },
    {
      key: "2",
      label: "จัดการข้อมูลการจ่ายยา",
      children: (
        <Card>
          <MaDispenseTable
            data={dispenseData}
            fetchData={fetchData}
            drugs={drugs}
            dataUser={dataUser}
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Tabs defaultActiveKey="1" items={items} />
        </Col>
      </Row>
    </div>
  );
}
