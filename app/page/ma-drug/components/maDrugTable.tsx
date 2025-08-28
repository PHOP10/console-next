"use client";

import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { MaDrugType } from "../../common";

export default function maDrugTable() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  const [data, setData] = useState<MaDrugType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await intraAuthService.getMaDrugQuery();
      // ปรับให้แน่ใจว่าผลลัพธ์เป็น array
      setData(Array.isArray(result) ? result : result?.data || []);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
      message.error("ไม่สามารถดึงข้อมูลการเบิกยาได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnsType<MaDrugType> = [
    {
      title: "รหัสเบิกยา",
      dataIndex: "MaDrugId",
      key: "MaDrugId",
    },
    {
      title: "เลขที่เบิก",
      dataIndex: "requestNumber",
      key: "requestNumber",
    },
    {
      title: "หน่วยงาน",
      dataIndex: "requestUnit",
      key: "requestUnit",
    },
    {
      title: "เบิกครั้งที่",
      dataIndex: "roundNumber",
      key: "roundNumber",
    },
    {
      title: "ผู้ขอเบิก",
      dataIndex: "requesterName",
      key: "requesterName",
    },
    {
      title: "ผู้จัดยา",
      dataIndex: "dispenserName",
      key: "dispenserName",
    },
    {
      title: "วันที่ขอเบิก",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (value) => new Date(value).toLocaleDateString("th-TH"),
    },
    {
      title: "จำนวนที่เบิก",
      dataIndex: "quantityUsed",
      key: "quantityUsed",
    },
    {
      title: "หมายเหตุ",
      dataIndex: "note",
      key: "note",
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      bordered
      pagination={{ pageSize: 10 }}
    />
  );
}
