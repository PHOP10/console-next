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
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
// ✅ แนะนำให้ใช้ DispenseService ถ้าแยกไฟล์ไว้ หรือใช้ MaDrug ตามเดิมถ้าคุณรวมไว้ที่นั่น
import { MaDrug } from "../services/maDrug.service";
import { DispenseType } from "../../common";
import CustomTable from "../../common/CustomTable";
import DispenseTableDetail from "./dispenseTableDetail";
import { useSession } from "next-auth/react";
import { exportDispenseToExcel } from "./dispenseExport";

interface MaDispenseTableProps {
  data: DispenseType[];
  fetchData: () => void;
}

export default function MaDispenseTable({
  data,
  fetchData,
}: MaDispenseTableProps) {
  const intraAuth = useAxiosAuth();
  const dispenseService = MaDrug(intraAuth);
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DispenseType | null>(
    null,
  );

  // --- States สำหรับการอนุมัติ/ยกเลิก ---
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  // --- ฟังก์ชันเปิด Modal ยกเลิก ---
  const openCancelModal = (id: number) => {
    setCancelingId(id);
    setCancelReason("");
    setIsCancelModalOpen(true);
    setOpenPopoverId(null); // ปิด Popover
  };

  // --- ฟังก์ชัน Submit การยกเลิก ---
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

  // --- ฟังก์ชันอนุมัติ ---
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

  const handleViewDetail = (record: DispenseType) => {
    setSelectedRecord(record);
    setDetailVisible(true);
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
      title: "วันที่จ่าย",
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
            color = "success";
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
      width: 150,
      fixed: "right",
      render: (_, record) => {
        const isPending = record.status === "pending";

        return (
          <Space>
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
                  <Typography.Text strong>จัดการรายการ ?</Typography.Text>
                </Space>
              }
              content={
                <Space style={{ display: "flex", marginTop: 10 }}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleApprove(record.id)}
                  >
                    อนุมัติ
                  </Button>
                  <Button
                    danger
                    size="small"
                    onClick={() => openCancelModal(record.id)}
                  >
                    ยกเลิก
                  </Button>
                </Space>
              }
            >
              <Tooltip title={isPending ? "ตรวจสอบและอนุมัติ" : ""}>
                <Button
                  type="text"
                  shape="circle"
                  style={{
                    opacity: isPending ? 1 : 0.3,
                    cursor: isPending ? "pointer" : "not-allowed",
                  }}
                  icon={
                    <CheckCircleOutlined
                      style={{
                        fontSize: 20,
                        color: isPending ? "#52c41a" : "#ccc",
                      }}
                    />
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPending) setOpenPopoverId(record.id);
                  }}
                />
              </Tooltip>
            </Popover>

            <Tooltip title="ลบรายการ">
              <Popconfirm
                title="ยืนยันการลบ"
                description="คุณต้องการลบรายการนี้ใช่หรือไม่?"
                onConfirm={() => handleDelete(record.id)}
                okText="ลบ"
                cancelText="ยกเลิก"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  shape="circle"
                  danger
                  icon={<DeleteOutlined style={{ fontSize: 20 }} />}
                />
              </Popconfirm>
            </Tooltip>

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
          </Space>
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
        scroll={{ x: 900 }}
      />

      {/* Modal รายละเอียด */}
      <DispenseTableDetail
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        data={selectedRecord}
      />

      {/* ✅ Modal สำหรับกรอกเหตุผลการยกเลิก */}
      <Modal
        title={
          <div style={{ color: "#ff4d4f" }}>
            <CloseCircleOutlined />
          </div>
        }
        open={isCancelModalOpen}
        onOk={handleCancelSubmit}
        onCancel={() => setIsCancelModalOpen(false)}
        okText="ยืนยันการยกเลิก"
        cancelText="ปิด"
        okButtonProps={{ danger: true, loading: cancelLoading }}
      >
        <p>กรุณาระบุเหตุผลที่ต้องการยกเลิกรายการนี้:</p>
        <Input.TextArea
          rows={4}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="เช่น คีย์ข้อมูลผิด, ยาไม่พอจ่าย, หรืออื่นๆ..."
          autoFocus
        />
      </Modal>
    </>
  );
}
