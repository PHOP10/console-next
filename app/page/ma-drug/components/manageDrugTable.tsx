"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  message,
  Space,
  Tag,
  Card,
  Tooltip,
  Modal,
  Input,
  Popover,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  CheckCircleOutlined,
  FileExcelOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  EditOutlined,
  FormOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { MaDrugType } from "../../common";
import { exportMaDrugToExcel } from "./maDrugExport";
import { useSession } from "next-auth/react";
import MaDrugTableDetail from "./maDrugDetail";
import MaDrugEdit from "./maDrugEdit";
import CustomTable from "../../common/CustomTable";

interface ManageDrugTableProps {
  data: MaDrugType[];
  fetchData: () => void;
  setData: React.Dispatch<React.SetStateAction<MaDrugType[]>>;
}

export default function ManageDrugTable({
  data,
  fetchData,
  setData,
}: ManageDrugTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);
  const { data: session } = useSession();
  // const [data, setData] = useState<MaDrugType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaDrugType | null>(null);
  const [editVisible, setEditVisible] = useState(false);

  const openCancelModal = (id: number) => {
    setCancelingId(id);
    setCancelReason("");
    setIsCancelModalOpen(true);
    setOpenPopoverId(null);
  };

  const handleViewDetail = (record: MaDrugType) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const handleEdit = (record: MaDrugType) => {
    setSelectedRecord(record);
    setEditVisible(true);
  };

  // --- ฟังก์ชันลบข้อมูล ---
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await intraAuthService.deleteMaDrug(id);
      message.success("ลบข้อมูลสำเร็จ");
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      message.error("ลบข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // --- ฟังก์ชันอนุมัติ (กดจากใน Popover) ---
  const handleApprove = async (id: number) => {
    try {
      setLoading(true); // show loading
      await intraAuthService.updateMaDrug({ id, status: "approved" });
      message.success("อนุมัติรายการเรียบร้อย");
      setOpenPopoverId(null); // ปิด Popover
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("อนุมัติไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // --- ยืนยันการยกเลิก (Submit Cancel) ---
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
        status: "cancel",
        cancelReason: cancelReason,
        cancelName: session?.user?.fullName || "ไม่ระบุตัวตน",
      };

      await intraAuthService.updateMaDrug(payload);
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
      width: 120,
      render: (value) => new Date(value).toLocaleDateString("th-TH"),
    },
    {
      title: "รายการ",
      dataIndex: "quantityUsed",
      key: "quantityUsed",
      align: "center",
      render: (val) => `${val || 0} รายการ`,
    },
    {
      title: "ยอดรวม",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "center",
      render: (val) => (val ? `${Number(val).toLocaleString()} บ.` : "-"),
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
      title: "การจัดการ",
      key: "actions",
      align: "center",
      width: 180,
      render: (_, record) => {
        const isPending = record.status === "pending";
        return (
          <Space>
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
                <Space style={{ display: "flex", marginTop: 13 }}>
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
                  style={{
                    padding: 4,
                    pointerEvents: isPending ? "auto" : "none",
                  }}
                  icon={
                    <CheckCircleOutlined
                      style={{
                        fontSize: 22,
                        // ✅ Style สีและความทึบ
                        color: isPending ? "#52c41a" : "#ccc",
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

            {/* 3. ปุ่มลบ */}
            <Tooltip title="ลบรายการ">
              <Popconfirm
                title="ยืนยันการลบ"
                description="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?"
                onConfirm={() => handleDelete(record.id)}
                okText="ลบ"
                cancelText="ยกเลิก"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined style={{ fontSize: 22 }} />}
                />
              </Popconfirm>
            </Tooltip>

            {/* 4. ปุ่ม Export Excel */}
            <Tooltip title="พิมพ์ใบเบิก (Excel)">
              <FileExcelOutlined
                style={{
                  fontSize: 22, // ขนาดไอคอน
                  color: "#217346", // สีเขียว Excel
                  cursor: "pointer", // เปลี่ยนเมาส์เป็นรูปมือ
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
    <Card
      title={
        <div
          style={{
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#0683e9",
          }}
        >
          จัดการรายการใบเบิกยา
        </div>
      }
      bordered={false}
      style={{
        backgroundColor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <CustomTable
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
        scroll={{ x: 900 }}
      />
      <MaDrugTableDetail
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        data={selectedRecord}
      />

      {/* --- Modal สำหรับกรอกเหตุผลการยกเลิก (เปิดเมื่อกดปุ่ม "ยกเลิก" ใน Popover) --- */}
      <Modal
        title={
          <div style={{ color: "#ff4d4f" }}>
            <CloseCircleOutlined /> ยืนยันการยกเลิกรายการ
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
          placeholder="เช่น สั่งผิดรายการ, ยาหมดสต็อก, หรืออื่นๆ..."
          autoFocus
        />
      </Modal>
      <MaDrugEdit
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSuccess={() => {
          fetchData(); // โหลดข้อมูลใหม่หลังแก้ไขเสร็จ
        }}
        data={selectedRecord}
      />
    </Card>
  );
}
