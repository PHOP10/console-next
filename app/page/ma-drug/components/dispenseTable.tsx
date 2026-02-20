"use client";

import React, { useState } from "react";
import { Tag, Tooltip, Button, Space, message, Card } from "antd";
import {
  FileSearchOutlined,
  EditOutlined,
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
import dayjs from "dayjs";
import "dayjs/locale/th";

// Set locale globally
dayjs.locale("th");

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

  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
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

  const handleConfirm = (record: DispenseType) => {
    setSelectedRecord(record);
    setConfirmVisible(true);
  };

  const handleExport = (record: DispenseType) => {
    try {
      message.loading("กำลังสร้างไฟล์ Excel...", 1);
      exportDispenseToExcel(record,intraAuth);
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
      responsive: ["md"], // ซ่อนบนมือถือ
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
      title: "หมายเหตุ",
      dataIndex: "note",
      key: "note",
      align: "center",
      width: 150,
      ellipsis: true,
      responsive: ["lg"], // แสดงเฉพาะจอใหญ่
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
      width: 100,
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
      width: 160, // เพิ่มความกว้างเล็กน้อยสำหรับปุ่ม 4 ปุ่ม
      render: (_, record) => {
        const isEditable = record.status === "pending";
        const isConfirmable = record.status === "approved";
        const isCompleted = record.status === "completed";

        return (
          <Space size="small">
            <Tooltip
              title={isConfirmable ? "ยืนยันรับยาเข้าคลัง" : "รออนุมัติ"}
            >
              <Button
                type="text"
                shape="circle"
                disabled={!isConfirmable}
                icon={
                  <MedicineBoxOutlined
                    style={{
                      fontSize: 18,
                      color: isConfirmable ? "#faad14" : "#d9d9d9",
                    }}
                  />
                }
                onClick={() => handleConfirm(record)}
              />
            </Tooltip>

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
            <Tooltip title="พิมพ์ใบจ่ายยา">
              <FileExcelOutlined
                style={{
                  fontSize: 18,
                  color: "#217346",
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
                onClick={() => handleExport(record)}
              />
            </Tooltip>
            <Tooltip title="แก้ไข">
              <Button
                type="text"
                shape="circle"
                icon={
                  <EditOutlined
                    style={{
                      fontSize: 18,
                      color: isEditable ? "#faad14" : "#d9d9d9",
                    }}
                  />
                }
                disabled={!isEditable}
                onClick={() => isEditable && handleEdit(record)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-4 sm:mb-6 -mt-4 sm:-mt-7">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0683e9] text-center mb-2 tracking-tight">
          ข้อมูลรายการจ่ายยา
        </h2>
        <hr className="border-slate-100/30 -mx-4 sm:-mx-6" />
      </div>

      <Card bodyStyle={{ padding: 0 }} bordered={false}>
        <CustomTable
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          bordered
          size="small"
          pagination={{ pageSize: 10, size: "small" }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <DispenseTableDetail
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        data={selectedRecord}
      />

      <DispenseEdit
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSuccess={refreshData}
        data={selectedRecord}
        drugs={drugs}
        existingData={data}
      />

      <DispenseConfirmModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onSuccess={refreshData}
        data={selectedRecord}
      />
    </>
  );
}
