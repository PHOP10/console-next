"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  message,
  Card,
  Button,
  Tooltip,
  Popconfirm,
  Tag,
  Space,
} from "antd";
import {
  FileExcelOutlined,
  FileSearchOutlined,
  EditOutlined,
  MedicineBoxOutlined,
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
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Set locale globally
dayjs.extend(buddhistEra);
dayjs.locale("th");

interface MaDrugFormProps {
  data: MaDrugType[];
  fetchDrugs: () => void;
}

export default function MaDrugTable({ data, fetchDrugs }: MaDrugFormProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

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
      width: 100,
      responsive: ["sm"],
      render: (text) => {
        const shortText =
          text && text.length > 20 ? text.substring(0, 30) + "..." : text;
        return (
          <Tooltip title={text}>
            <span style={{ fontWeight: "normal" }}>{shortText || "-"}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "ผู้ขอเบิก",
      dataIndex: "requesterName",
      key: "requesterName",
      align: "center",
      width: 100,
      responsive: ["md"],
    },
    {
      title: "วันที่ขอเบิก",
      dataIndex: "requestDate",
      key: "requestDate",
      align: "center",
      width: 120,
      render: (text: string) => {
        if (!text) return "-";
        const dateObj = dayjs(text);
        return (
          <>
            {/* แสดงบนมือถือ: D MMM BB */}
            <span className="md:hidden font-normal">
              {dateObj.format("D MMM BB")}
            </span>
            {/* แสดงบนจอใหญ่: D MMMM BBBB */}
            <span className="hidden md:block font-normal">
              {dateObj.format("D MMMM BBBB")}
            </span>
          </>
        );
      },
    },
    {
      title: "รายการ",
      dataIndex: "quantityUsed",
      key: "quantityUsed",
      align: "center",
      width: 90,
      render: (val) => `${val || 0} รายการ`,
    },
    {
      title: "ยอดรวม",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "center",
      width: 100,
      render: (val) => (
        <span className="text-blue-600 font-semibold">
          {val
            ? val.toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "0.00"}
        </span>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 100,
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
            color = "default";
            text = "รับยาแล้ว";
            break;
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
      width: 160,
      render: (_, record) => {
        const isPending = record.status === "pending";
        const canReceive = record.status === "approved";

        return (
          <Space size="small">
            {/* 2. ปุ่มรับยา */}
            {canReceive && (
              <Tooltip title="ยืนยันรับยาเข้าคลัง">
                <Button
                  type="text"
                  shape="circle"
                  icon={
                    <MedicineBoxOutlined
                      style={{ fontSize: 18, color: "#52c41a" }} // ปรับขนาดไอคอนเป็น 18px
                    />
                  }
                  onClick={() => handleOpenReceive(record)}
                />
              </Tooltip>
            )}

            {/* 3. ดูรายละเอียด */}
            <Tooltip title="ดูรายละเอียด">
              <Button
                type="text"
                shape="circle"
                icon={
                  <FileSearchOutlined
                    style={{ fontSize: 18, color: "#1677ff" }}
                  />
                }
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>

            {/* 4. พิมพ์ใบเบิก */}
            <Tooltip title="พิมพ์ใบเบิกยา">
              <Button
                type="text"
                shape="circle"
                icon={
                  <FileExcelOutlined
                    style={{ fontSize: 18, color: "#217346" }}
                  />
                }
                onClick={() => handleExport(record)}
              />
            </Tooltip>
            {/* 1. ปุ่มแก้ไข */}
            <Tooltip title="แก้ไขข้อมูล">
              <Button
                type="text"
                shape="circle"
                icon={
                  <EditOutlined
                    style={{
                      fontSize: 18,
                      color: isPending ? "#faad14" : "#d9d9d9",
                    }}
                  />
                }
                disabled={!isPending}
                onClick={() => isPending && handleEdit(record)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-[#0683e9] text-center mb-2 tracking-tight">
          ข้อมูลรายการเบิกยา
        </h2>
        <hr className="border-slate-100/30 -mx-6 md:-mx-6" />
      </div>

      <CustomTable
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        size="small" // ใช้ size small บนมือถือ
        pagination={{ pageSize: 10, size: "small" }}
        scroll={{ x: "max-content" }} // เพิ่ม scroll แนวนอน
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
        existingData={data}
      />

      <MaDrugReceiveModal
        visible={receiveVisible}
        onClose={() => setReceiveVisible(false)}
        onSuccess={() => fetchDrugs()}
        data={selectedRecord}
      />
    </>
  );
}
