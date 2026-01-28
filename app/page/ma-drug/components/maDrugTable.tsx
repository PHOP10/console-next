"use client";

import React, { useEffect, useState } from "react";
import { Table, message, Card, Button, Tooltip, Popconfirm, Tag } from "antd";
import {
  FileExcelOutlined,
  FileSearchOutlined,
  EditOutlined,
  DownloadOutlined, // ไอคอนสำหรับรับของ
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { MaDrugType } from "../../common";
import { exportMaDrugToExcel } from "./maDrugExport";
import MaDrugTableDetail from "./maDrugDetail";
import MaDrugEdit from "./maDrugEdit";
import CustomTable from "../../common/CustomTable";
import MaDrugReceiveModal from "./maDrugReceiveModal";

interface MaDrugFormProps {
  data: MaDrugType[];
  fetchDrugs: () => void;
}

export default function MaDrugTable({ data, fetchDrugs }: MaDrugFormProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  // const [data, setData] = useState<MaDrugType[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaDrugType | null>(null);
  const [receiveVisible, setReceiveVisible] = useState(false);

  const handleViewDetail = (record: MaDrugType) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const handleEdit = (record: MaDrugType) => {
    setSelectedRecord(record);
    setEditVisible(true);
  };

  const handleOpenReceive = (record: MaDrugType) => {
    setSelectedRecord(record);
    setReceiveVisible(true);
  };

  const handleExport = (record: MaDrugType) => {
    try {
      message.loading("กำลังสร้างไฟล์ Excel...", 1);
      exportMaDrugToExcel(record);
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการสร้างไฟล์");
    }
  };

  const handleReceive = async (id: number) => {
    try {
      setLoading(true);
      // เรียก API ไปที่ Backend เพื่อเปลี่ยนสถานะและอัปเดตสต็อก
      // คุณต้องเพิ่ม method receiveMaDrug ใน service ของคุณด้วย
      await intraAuthService.receiveMaDrug(id);

      message.success("รับยาเข้าคลังเรียบร้อยแล้ว (อัปเดตสต็อกสำเร็จ)");
      fetchDrugs(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error(error);
      message.error("ไม่สามารถทำรายการได้");
    } finally {
      setLoading(false);
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
      title: "ผู้ขอเบิก",
      dataIndex: "requesterName",
      key: "requesterName",
      align: "center",
    },
    {
      title: "วันที่ขอเบิก",
      dataIndex: "requestDate",
      key: "requestDate",
      align: "center",
      render: (text: string) => {
        if (!text) return "-";
        const date = new Date(text);
        return new Intl.DateTimeFormat("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(date);
      },
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        let color = "default";
        let text = "-";
        switch (status) {
          case "pending":
            color = "blue";
            text = "รออนุมัติ";
            break;
          case "approved":
            color = "green";
            text = "อนุมัติแล้ว";
            break;
          case "completed":
            color = "gray";
            text = "รับยาแล้ว";
            break;
          case "cancel":
          case "cancel":
            color = "red";
            text = "ยกเลิก";
            break;
          default:
            text = status;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 220,
      render: (_, record) => {
        const isPending = record.status === "pending";
        const isApproved = record.status === "approved";
        const isCompleted = record.status === "completed";
        const isCanceled =
          record.status === "canceled" || record.status === "cancel";

        // เงื่อนไขการกดปุ่มต่างๆ
        const canEdit = isPending;
        const canReceive = isApproved;
        const canExport = isApproved || isCompleted;

        return (
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* 1. ปุ่มแก้ไข (เปลี่ยนจากซ่อน เป็น Disable) */}
            <Tooltip title="แก้ไขข้อมูล">
              <EditOutlined
                type="primary"
                shape="circle"
                // icon={<EditOutlined />}
                // size="small"
                style={{
                  fontSize: 22, // ปรับขนาดตามความเหมาะสม
                  color: record.status === "pending" ? "#faad14" : "#d9d9d9",
                  cursor:
                    record.status === "pending" ? "pointer" : "not-allowed",
                  transition: "color 0.2s",
                }}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>

            {canReceive && (
              <Tooltip title="ยืนยันรับยาเข้าคลัง">
                {/* ไม่ต้องใช้ Popconfirm แล้ว เพราะมี Modal ยืนยัน */}
                <Button
                  type="primary"
                  shape="circle"
                  icon={<DownloadOutlined />}
                  size="small"
                  style={{
                    backgroundColor: "#13c2c2",
                    borderColor: "#13c2c2",
                  }}
                  onClick={() => handleOpenReceive(record)} // ✅ เรียกเปิด Modal แทน
                />
              </Tooltip>
            )}

            {/* 3. ดูรายละเอียด (ดูได้ตลอด) */}
            <Tooltip title="ดูรายละเอียด">
              <Button
                type="text"
                icon={
                  <FileSearchOutlined
                    style={{ fontSize: 22, color: "#1677ff" }}
                  />
                }
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>

            {/* 4. ปุ่ม Export (Disable ถ้ายังไม่ Approve) */}
            <Tooltip title="พิมพ์ใบเบิกยา">
              <FileExcelOutlined
                style={{
                  fontSize: 22,
                  color: "#217346",
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
                onClick={() => handleExport(record)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-blue-500 text-center mb-2 tracking-tight">
          รายการเบิกจ่ายยา
        </h2>
        {/* เส้น Divider จางๆ แบบเดียวกับปฏิทิน */}
        <hr className="border-slate-100/30 -mx-6 md:-mx-6" />
      </div>

      <CustomTable
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />

      <MaDrugTableDetail
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        data={selectedRecord}
      />

      <MaDrugEdit
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSuccess={() => fetchDrugs()}
        data={selectedRecord}
      />
      <MaDrugReceiveModal
        visible={receiveVisible}
        onClose={() => setReceiveVisible(false)}
        onSuccess={() => fetchDrugs()} // โหลดข้อมูลใหม่เมื่อรับยาเสร็จ
        data={selectedRecord}
      />
    </>
  );
}
