"use client";

import React, { useEffect, useState } from "react";
import { Table, message, Card } from "antd";
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
      align: "center",
    },
    {
      title: "เลขที่เบิก",
      dataIndex: "requestNumber",
      key: "requestNumber",
      align: "center",
    },
    {
      title: "หน่วยงาน",
      dataIndex: "requestUnit",
      key: "requestUnit",
      align: "center",
    },
    {
      title: "เบิกครั้งที่",
      dataIndex: "roundNumber",
      key: "roundNumber",
      align: "center",
    },
    {
      title: "ผู้ขอเบิก",
      dataIndex: "requesterName",
      key: "requesterName",
      align: "center",
    },
    {
      title: "ผู้จัดยา",
      dataIndex: "dispenserName",
      key: "dispenserName",
      align: "center",
    },
    {
      title: "วันที่ขอเบิก",
      dataIndex: "requestDate",
      key: "requestDate",
      align: "center",
      render: (value) => new Date(value).toLocaleDateString("th-TH"),
    },
    {
      title: "จำนวนที่เบิก",
      dataIndex: "quantityUsed",
      key: "quantityUsed",
      align: "center",
    },
    {
      title: "หมายเหตุ",
      dataIndex: "note",
      key: "note",
      align: "center",
    },
  ];

  return (
    <Card
      bordered
      style={{ backgroundColor: "white" }} // พื้นหลัง Card สีขาว
      title={
        <div
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#0683e9",
          }}
        >
          ข้อมูลการเบิกจ่ายยา
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
        scroll={{ x: 1000 }} // หากต้องการให้ตารางเลื่อนแนวนอน
      />
    </Card>
  );
}
