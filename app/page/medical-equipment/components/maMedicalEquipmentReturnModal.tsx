"use client";

import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Tag, Button, Input, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import type { ColumnsType } from "antd/es/table";
import CustomTable from "../../common/CustomTable";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import {
  RollbackOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback เมื่อรับคืนสำเร็จ
  record: any;
}

export default function MaMedicalEquipmentReturnModal({
  open,
  onClose,
  onSuccess,
  record,
}: Props) {
  const [loading, setLoading] = useState(false);
  const intraAuth = useAxiosAuth();
  const intraAuthService = maMedicalEquipmentServices(intraAuth);
  const { data: session } = useSession();
  const [returnNote, setReturnNote] = useState("");

  // Reset note เมื่อเปิด modal ใหม่
  useEffect(() => {
    if (open && record) {
      setReturnNote(record.note || "");
    }
  }, [open, record]);

  // --- Helper Functions ---
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return dayjs(dateString).locale("th").format("DD MMMM YYYY");
  };

  const getStatusTag = (status: string) => {
    const baseStyle = "px-3 py-1 rounded-full text-sm font-medium border-0";
    switch (status) {
      case "pending":
        return (
          <Tag color="orange" className={baseStyle}>
            รออนุมัติ
          </Tag>
        );
      case "approve":
        return (
          <Tag color="green" className={baseStyle}>
            อนุมัติ
          </Tag>
        );
      case "return":
        return (
          <Tag color="purple" className={baseStyle}>
            รับคืนแล้ว
          </Tag>
        );
      case "verified":
        return (
          <Tag color="grey" className={baseStyle}>
            ตรวจรับคืนแล้ว
          </Tag>
        );
      case "cancel":
        return (
          <Tag color="red" className={baseStyle}>
            ยกเลิก
          </Tag>
        );
      default:
        return <Tag className={baseStyle}>{status}</Tag>;
    }
  };

  // --- Handle Confirm Return ---
  const handleConfirmReturn = async () => {
    if (!record) return;
    try {
      setLoading(true);
      await intraAuthService.updateMaMedicalEquipment({
        id: record.id,
        status: "return", // เปลี่ยนสถานะเป็น return
        returnName: session?.user?.fullName, // บันทึกชื่อคนรับคืน
        returndAt: new Date().toISOString(), // บันทึกเวลารับคืน
        note: returnNote, // บันทึกหมายเหตุล่าสุด
      });

      message.success("รับคืนอุปกรณ์เรียบร้อยแล้ว");
      onSuccess(); // แจ้ง Parent ให้ Refresh
      onClose();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการรับคืนอุปกรณ์:", error);
      message.error("ไม่สามารถรับคืนอุปกรณ์ได้");
    } finally {
      setLoading(false);
    }
  };

  // --- Table Columns ---
  const columns: ColumnsType<any> = [
    {
      title: "ลำดับ",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <span className="text-slate-400">{index + 1}</span>
      ),
    },
    {
      title: "รายการ",
      dataIndex: ["medicalEquipment", "equipmentName"],
      key: "equipmentName",
      render: (text: string) => (
        <span className="font-medium text-slate-700">{text}</span>
      ),
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 120,
      render: (quantity: number) => (
        <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-xs font-semibold">
          {quantity} ชิ้น
        </span>
      ),
    },
  ];

  // --- Styled Components (เหมือน Details) ---
  const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="text-slate-500 text-xs sm:text-sm font-medium mb-1">
      {children}
    </div>
  );
  const Value: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="text-slate-800 text-sm sm:text-base break-words font-semibold">
      {children}
    </div>
  );

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
      style={{ maxWidth: "100%", paddingBottom: 0 }}
      modalRender={(modal) => (
        <div className="bg-slate-100/50 rounded-2xl overflow-hidden shadow-2xl font-sans">
          {modal}
        </div>
      )}
      styles={{
        body: { padding: 0, backgroundColor: "transparent" },
        header: { display: "none" },
      }}
    >
      {record && (
        <div className="flex flex-col">
          {/* Header */}
          <div className="bg-white px-6 py-5 border-b border-slate-200 flex justify-between items-start sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-[#0683e9] m-0 flex items-center gap-2">
                ยืนยันการรับคืนอุปกรณ์
              </h2>
              <div className="text-slate-500 text-sm mt-1">
                กรุณาตรวจสอบสภาพของและจำนวนก่อนยืนยัน
              </div>
            </div>
            <div className="text-right">{getStatusTag(record.status)}</div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {/* Info Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[24, 20]}>
                <Col xs={24} sm={12}>
                  <Label>
                    <UserOutlined /> ผู้ส่งเครื่องมือ :
                  </Label>
                  <Value>{record.createdBy || "-"}</Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>
                    <CalendarOutlined /> วันที่ส่ง :
                  </Label>
                  <Value>{formatDate(record.sentDate)}</Value>
                </Col>
              </Row>
            </div>

            {/* Table Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4 overflow-hidden">
              <h3 className="text-slate-800 font-semibold mb-4 text-base pl-2 border-l-4 border-blue-500">
                รายการอุปกรณ์ที่ต้องรับคืน
              </h3>
              <CustomTable
                dataSource={record.items || []}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                bordered={false}
                rowClassName="hover:bg-slate-50 transition-colors"
                components={{
                  header: {
                    cell: (props: any) => (
                      <th
                        {...props}
                        style={{
                          backgroundColor: "#f8fafc",
                          color: "#64748b",
                          fontWeight: 600,
                        }}
                      />
                    ),
                  },
                }}
              />
            </div>

            {/* Note Input (Editable) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Label>หมายเหตุ / สภาพของที่รับคืน :</Label>
              <Input.TextArea
                rows={3}
                placeholder="ระบุหมายเหตุเพิ่มเติม เช่น อุปกรณ์ครบถ้วน, สภาพสมบูรณ์"
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                className="rounded-xl border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 mt-2"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <Button
              onClick={onClose}
              className="h-10 px-6 rounded-lg text-slate-600 hover:bg-slate-100 border-slate-300"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              onClick={handleConfirmReturn}
              loading={loading}
              className="h-10 px-6 rounded-lg shadow-md bg-[#722ed1] hover:bg-[#5b25a8] border-0"
            >
              ยืนยันรับคืน
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
