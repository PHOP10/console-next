"use client";

import React, { useState } from "react";
import { Table, Tag, Tooltip, Button, Space, message } from "antd";
import {
  FileSearchOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ExportOutlined,
  DropboxOutlined,
  ShoppingOutlined,
  MedicineBoxOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import CustomTable from "../../common/CustomTable";
import { DispenseType, DrugType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import DispenseTableDetail from "./dispenseTableDetail";
import DispenseEdit from "./dispenseEdit";
import DispenseConfirmModal from "./dispenseConfirmModal";
import { exportDispenseToExcel } from "./dispenseExport";

interface DispenseTableProps {
  data: DispenseType[];
  refreshData: () => void;
  drugs: DrugType[];
}

export default function DispenseTable({
  data,
  refreshData,
  drugs,
}: DispenseTableProps) {
  const [loading, setLoading] = useState(false);
  const intraAuth = useAxiosAuth();
  const dispenseService = MaDrug(intraAuth);

  // State สำหรับดูรายละเอียด
  const [detailVisible, setDetailVisible] = useState(false);

  // State สำหรับแก้ไข
  const [editVisible, setEditVisible] = useState(false);

  // ✅ State สำหรับยืนยันการจ่ายยา
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<DispenseType | null>(
    null,
  );

  const handleViewDetail = (record: DispenseType) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const handleEdit = (record: DispenseType) => {
    setSelectedRecord(record);
    setEditVisible(true);
  };

  // ✅ ฟังก์ชันเปิดหน้ายืนยันการจ่ายยา
  const handleConfirm = (record: DispenseType) => {
    setSelectedRecord(record);
    setConfirmVisible(true);
  };

  const handleExport = (record: DispenseType) => {
    try {
      message.loading("กำลังสร้างไฟล์ Excel...", 1);
      exportDispenseToExcel(record);
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการสร้างไฟล์");
    }
  };

  const columns: ColumnsType<DispenseType> = [
    {
      title: "ผู้จ่ายยา",
      dataIndex: "dispenserName",
      key: "dispenserName",
      align: "center",
      width: 150,
      render: (text) => (
        <span className="font-medium text-slate-700">{text || "-"}</span>
      ),
    },
    {
      title: "วันที่จ่ายยา",
      dataIndex: "dispenseDate",
      key: "dispenseDate",
      align: "center",
      width: 130,
      render: (text: string) => {
        if (!text) return "-";
        return new Intl.DateTimeFormat("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(text));
      },
    },

    {
      title: "หมายเหตุ",
      dataIndex: "note",
      key: "note",
      align: "center",
      width: 150,
      ellipsis: true,
      render: (text) => <span className="text-gray-500">{text || "-"}</span>,
    },
    {
      title: "มูลค่ารวม",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "right",
      width: 120,
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
      width: 120,
      render: (status) => {
        let color = "default";
        let text = status;
        switch (status) {
          case "pending":
            color = "blue";
            text = "รออนุมัติ";
            break;
          case "approved":
            color = "success";
            text = "อนุมัติแล้ว";
            break;
          case "completed":
            color = "default";
            text = "จ่ายยาสำเร็จ";
            break;
          case "canceled":
            color = "error";
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
      width: 150,
      // fixed: "right",
      render: (_, record) => {
        const isEditable = record.status === "pending";
        const isConfirmable = record.status === "approved";

        return (
          <div className="flex justify-center items-center gap-2">
            {isConfirmable && (
              <Tooltip title="ยืนยันการจ่ายยา (ตัดสต็อก)">
                <Button
                  type="text"
                  shape="circle"
                  icon={
                    <MedicineBoxOutlined
                      style={{ fontSize: 22, color: "#faad14" }}
                    />
                  } // สีเขียว
                  onClick={() => handleConfirm(record)}
                />
              </Tooltip>
            )}

            {/* ปุ่มแก้ไข */}
            {isEditable && (
              <Tooltip title="แก้ไข">
                <Button
                  type="text"
                  shape="circle"
                  icon={
                    <EditOutlined style={{ fontSize: 20, color: "#faad14" }} />
                  } // สีส้ม
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
            )}

            <Tooltip title="ดูรายละเอียด">
              <Button
                type="text"
                shape="circle"
                icon={
                  <FileSearchOutlined
                    style={{ fontSize: 20, color: "#1677ff" }}
                  />
                }
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
            <Tooltip title="พิมพ์ใบจ่ายยา">
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
        <h2 className="text-2xl font-bold text-[#0683e9] text-center mb-2 tracking-tight">
          ข้อมูลรายการจ่ายยา
        </h2>
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

      {/* Modal ดูรายละเอียด */}
      <DispenseTableDetail
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        data={selectedRecord}
      />

      {/* Modal แก้ไข */}
      <DispenseEdit
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSuccess={refreshData}
        data={selectedRecord}
        drugs={drugs}
        existingData={data}
      />

      {/* ✅ Modal ยืนยันการจ่ายยา */}
      <DispenseConfirmModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onSuccess={refreshData}
        data={selectedRecord}
      />
    </>
  );
}
