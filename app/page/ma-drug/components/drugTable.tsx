"use client";

import React, { useEffect, useState } from "react";
import { Table, message, Card } from "antd";
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
      title: "รหัสยา",
      dataIndex: "workingCode",
      key: "workingCode",
      align: "center",
    },
    {
      title: "ชื่อยา",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "ประเภทยา (drugTypeId)",
      dataIndex: "drugTypeId",
      key: "drugTypeId",
      align: "center",
    },
    {
      title: "ขนาดบรรจุ",
      dataIndex: "packagingSize",
      key: "packagingSize",
      align: "center",
    },
    {
      title: "ราคา/หน่วย",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (value) =>
        value.toLocaleString("th-TH", { style: "currency", currency: "THB" }),
    },
    {
      title: "จำนวนคงเหลือ",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "หมายเหตุ",
      dataIndex: "note",
      key: "note",
      align: "center",
    },
    {
      title: "วันที่สร้าง",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (value) => new Date(value).toLocaleDateString("th-TH"),
    },
    {
      title: "อัพเดทล่าสุด",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      render: (value) => new Date(value).toLocaleDateString("th-TH"),
    },
  ];

  return (
    <Card
      title={
        <div
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#0683e9",
          }}
        >
          ข้อมูลยา
        </div>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
