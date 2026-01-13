"use client";

import React, { useEffect, useState } from "react";
import { Table, message, Card, Button, Tooltip } from "antd";
import { FileExcelOutlined, EyeOutlined } from "@ant-design/icons"; // เพิ่ม Icons
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { MaDrugType } from "../../common";
import { exportMaDrugToExcel } from "./maDrugExport";

export default function MaDrugTable() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  const [data, setData] = useState<MaDrugType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await intraAuthService.getMaDrugQuery();
      // ต้องแน่ใจว่า Backend ส่ง maDrugItems มาด้วย (include: { maDrugItems: { include: { drug: true } } })
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

  // ฟังก์ชันกดปุ่ม Export
  const handleExport = (record: MaDrugType) => {
    try {
      message.loading("กำลังสร้างไฟล์ Excel...", 1);
      exportMaDrugToExcel(record); // เรียกใช้ฟังก์ชันจาก maDrugExport.tsx
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการสร้างไฟล์");
    }
  };

  const columns: ColumnsType<MaDrugType> = [
    {
      title: "เลขที่เบิก",
      dataIndex: "requestNumber",
      key: "requestNumber",
      align: "center",
      width: 120,
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
      width: 80,
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
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (text) => (
        <span style={{ color: text === "pending" ? "orange" : "green" }}>
          {text}
        </span>
      ),
    },
    {
      title: "จัดการ", // ✅ เพิ่มคอลัมน์จัดการ
      key: "action",
      align: "center",
      width: 150,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          {/* ปุ่มดูรายละเอียด (ตัวอย่าง) */}
          <Tooltip title="ดูรายละเอียด">
            <Button icon={<EyeOutlined />} size="small" />
          </Tooltip>

          {/* ปุ่ม Export Excel */}
          <Tooltip title="พิมพ์ใบเบิก (Excel)">
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              size="small"
              style={{ backgroundColor: "#217346", borderColor: "#217346" }} // สีเขียว Excel
              onClick={() => handleExport(record)}
            >
              Export
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Card
      bordered
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
      title={
        <div
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#0683e9",
          }}
        >
          📋 ประวัติการเบิกจ่ายยา
        </div>
      }
    >
      <Table
        rowKey="id" // เปลี่ยนเป็น id ตาม Prisma model ปกติ
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />
    </Card>
  );
}
