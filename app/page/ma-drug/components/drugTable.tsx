"use client";

import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType } from "../../common";
// import type { DrugType } from "../types/maDrugTypes"; // type ของ Drug

export default function DrugTable() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  const [data, setData] = useState<DrugType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await intraAuthService.getDrugQuery();
      setData(Array.isArray(result) ? result : result?.data || []);
    } catch (error) {
      console.error("โหลดข้อมูลยาไม่สำเร็จ:", error);
      message.error("ไม่สามารถดึงข้อมูลยาได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnsType<DrugType> = [
    {
      title: "รหัสยา (DrugId)",
      dataIndex: "DrugId",
      key: "DrugId",
    },
    {
      title: "Working Code",
      dataIndex: "workingCode",
      key: "workingCode",
    },
    {
      title: "ชื่อยา",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "ประเภทยา (drugTypeId)",
      dataIndex: "drugTypeId",
      key: "drugTypeId",
    },
    {
      title: "ขนาดบรรจุ",
      dataIndex: "packagingSize",
      key: "packagingSize",
    },
    {
      title: "ราคา/หน่วย",
      dataIndex: "price",
      key: "price",
      render: (value) =>
        value.toLocaleString("th-TH", { style: "currency", currency: "THB" }),
    },
    {
      title: "จำนวนคงเหลือ",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "หมายเหตุ",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => new Date(value).toLocaleDateString("th-TH"),
    },
    {
      title: "อัพเดทล่าสุด",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value) => new Date(value).toLocaleDateString("th-TH"),
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
