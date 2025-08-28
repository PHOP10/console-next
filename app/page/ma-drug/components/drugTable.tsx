"use client";

import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType } from "../../common";
// import type { DrugType } from "../types/maDrugTypes"; // type ของ Drug

interface DrugTableProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  data: DrugType[];
}

export default function DrugTable({
  setLoading,
  loading,
  data,
}: DrugTableProps) {
  const columns: ColumnsType<DrugType> = [
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
