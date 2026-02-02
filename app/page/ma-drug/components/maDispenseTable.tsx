"use client";

import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Tooltip,
  Popconfirm,
  message,
  Space,
  Popover,
  Typography,
  Modal,
  Input,
  Card,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileSearchOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FileExcelOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DispenseType, DrugType } from "../../common";
import CustomTable from "../../common/CustomTable";
import DispenseTableDetail from "./dispenseTableDetail";
import { useSession } from "next-auth/react";
import { exportDispenseToExcel } from "./dispenseExport";
import dayjs from "dayjs";
import "dayjs/locale/th";
import DispenseEdit from "./dispenseEdit";

// Set locale globally
dayjs.locale("th");

interface MaDispenseTableProps {
  data: DispenseType[];
  fetchData: () => void;
  drugs: DrugType[];
}

export default function MaDispenseTable({
  data,
  fetchData,
  drugs,
}: MaDispenseTableProps) {
  const intraAuth = useAxiosAuth();
  const dispenseService = MaDrug(intraAuth);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DispenseType | null>(
    null,
  );
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const openCancelModal = (id: number) => {
    setCancelingId(id);
    setCancelReason("");
    setIsCancelModalOpen(true);
    setOpenPopoverId(null);
  };

  const handleViewDetail = (record: DispenseType) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const handleEdit = (record: DispenseType) => {
    setSelectedRecord(record);
    setEditVisible(true);
  };

  const handleCancelSubmit = async () => {
    if (!cancelReason.trim()) {
      message.warning("กรุณาระบุเหตุผลในการยกเลิก");
      return;
    }
    if (!cancelingId) return;

    try {
      setCancelLoading(true);
      const payload = {
        id: cancelingId,
        status: "canceled",
        cancelReason: cancelReason,
        cancelName: session?.user?.fullName || "Admin",
      };

      await dispenseService.updateDispense(payload);

      message.success("ยกเลิกรายการเรียบร้อยแล้ว");
      setIsCancelModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการยกเลิก");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setLoading(true);
      await dispenseService.updateDispense({ id, status: "approved" });

      message.success("อนุมัติรายการเรียบร้อย");
      setOpenPopoverId(null);
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("อนุมัติไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await dispenseService.deleteDispense(id);
      message.success("ลบรายการเรียบร้อยแล้ว");
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("ไม่สามารถลบรายการได้");
    } finally {
      setLoading(false);
    }
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
      responsive: ["md"], // ซ่อนบนมือถือ
      render: (text) => (
        <span className="font-medium text-slate-700">{text || "-"}</span>
      ),
    },
    {
      title: "วันที่จ่าย",
      dataIndex: "dispenseDate",
      key: "dispenseDate",
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
            text = "จ่ายสำเร็จ";
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
      width: 180, // เพิ่มความกว้างให้พอสำหรับปุ่ม
      render: (_, record) => {
        const isPending = record.status === "pending";

        return (
          <Space size="small">
            {/* 1. ปุ่มอนุมัติ */}
            <Popover
              trigger={isPending ? "click" : []}
              open={isPending && openPopoverId === record.id}
              onOpenChange={(open) => {
                if (isPending) {
                  setOpenPopoverId(open ? record.id : null);
                }
              }}
              title={
                <Space>
                  <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                  <Typography.Text strong>ยืนยันการอนุมัติ ?</Typography.Text>
                </Space>
              }
              content={
                <Space
                  style={{
                    display: "flex",
                    justifyContent: "flex-end", // จัดชิดขวา
                    width: "100%", // ขยายเต็มความกว้าง
                    marginTop: 13,
                  }}
                >
                  <Button
                    danger
                    size="small"
                    onClick={() => openCancelModal(record.id)}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleApprove(record.id)}
                    style={{
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                    }}
                  >
                    อนุมัติ
                  </Button>
                </Space>
              }
            >
              <Tooltip title={isPending ? "ตรวจสอบและอนุมัติ" : ""}>
                <Button
                  type="text"
                  shape="circle"
                  style={{
                    color: isPending ? "#52c41a" : "#ccc",
                    cursor: isPending ? "pointer" : "not-allowed",
                  }}
                  icon={
                    <CheckCircleOutlined
                      style={{
                        fontSize: 18, // ขนาด 18px
                        opacity: isPending ? 1 : 0.5,
                      }}
                    />
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPending) {
                      setOpenPopoverId(record.id);
                    }
                  }}
                />
              </Tooltip>
            </Popover>

            {/* 2. ดูรายละเอียด */}
            <Tooltip title="ดูรายละเอียด">
              <Button
                type="text"
                shape="circle"
                icon={
                  <FileSearchOutlined
                    style={{ fontSize: 18, color: "#1677ff" }} // ขนาด 18px
                  />
                }
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>

            {/* 3. ปุ่ม Export Excel */}
            <Tooltip title="พิมพ์ใบจ่ายยา">
              <Button
                type="text"
                shape="circle"
                icon={
                  <FileExcelOutlined
                    style={{ fontSize: 18, color: "#217346" }} // ขนาด 18px
                  />
                }
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
                      color: isPending ? "#faad14" : "#d9d9d9",
                    }}
                  />
                }
                disabled={!isPending}
                onClick={() => isPending && handleEdit(record)}
              />
            </Tooltip>

            {/* 4. ปุ่มลบ */}
            <Tooltip title="ลบรายการ">
              <Popconfirm
                title="ยืนยันการลบ"
                description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
                onConfirm={() => handleDelete(record.id)}
                okText="ลบ"
                cancelText="ยกเลิก"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  shape="circle"
                  danger
                  icon={
                    <DeleteOutlined
                      style={{ fontSize: 18, color: "#ff4d4f" }}
                    /> // ขนาด 18px
                  }
                />
              </Popconfirm>
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
          จัดการรายการจ่ายยา
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

      <DispenseTableDetail
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        data={selectedRecord}
      />

      <Modal
        title={
          <div className="flex items-center gap-2">ยืนยันการยกเลิกรายการ</div>
        }
        open={isCancelModalOpen}
        onOk={handleCancelSubmit}
        onCancel={() => setIsCancelModalOpen(false)}
        okText="ยืนยันการยกเลิก"
        okButtonProps={{ danger: true, loading: cancelLoading }}
        centered
        style={{ maxWidth: "95%" }}
      >
        <Input.TextArea
          rows={4}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="กรอกเหตุผลที่ยกเลิก..."
          autoFocus
        />
      </Modal>

      <DispenseEdit
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSuccess={fetchData}
        data={selectedRecord}
        drugs={drugs}
        existingData={data}
      />
    </>
  );
}
