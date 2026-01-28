"use client";

import React, { useState, useEffect } from "react";
import { Col, message, Row, Tabs, TabsProps } from "antd";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import MaDrugDaisbursementTable from "../components/manageDrugTable";
import MaDispenseTable from "../components/maDispenseTable";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { MaDrugType, DispenseType } from "../../common";

export default function Page() {
  const intraAuth = useAxiosAuth();
  const { data: session } = useSession();
  const [manualLoading, setManualLoading] = useState<boolean>(false);
  const [requestData, setRequestData] = useState<MaDrugType[]>([]);
  const [dispenseData, setDispenseData] = useState<DispenseType[]>([]);

  // 4. สร้าง Fetcher Function
  const fetcher = async () => {
    const maDrugService = MaDrug(intraAuth);

    // ดึงข้อมูลพร้อมกัน
    const [requestsRes, dispensesRes] = await Promise.all([
      maDrugService.getMaDrugQuery(),
      maDrugService.getDispenseQuery(),
    ]);

    return {
      requests: Array.isArray(requestsRes)
        ? requestsRes
        : requestsRes?.data || [],
      dispenses: Array.isArray(dispensesRes)
        ? dispensesRes
        : dispensesRes?.data || [],
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

  // 6. Sync ข้อมูลเข้า State
  useEffect(() => {
    if (swrData) {
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
        <MaDrugDaisbursementTable
          data={requestData}
          fetchData={fetchData}
          setData={setRequestData}
        />
      ),
    },
    {
      key: "2",
      label: "จัดการข้อมูลการจ่ายยา",
      children: <MaDispenseTable data={dispenseData} fetchData={fetchData} />,
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
