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
  onSuccess: () => void;
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

  useEffect(() => {
    if (open && record) {
      setReturnNote(record.returnNote || "");
    }
  }, [open, record]);

  // --- Helper Functions ---
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

  const handleConfirmReturn = async () => {
    if (!record) return;
    try {
      setLoading(true);
      await intraAuthService.updateMaMedicalEquipment({
        id: record.id,
        status: "return",
        returnName: session?.user?.fullName,
        returndAt: new Date().toISOString(),
        returnNote: returnNote,
      });

      message.success("รับคืนอุปกรณ์เรียบร้อยแล้ว");
      onSuccess();
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
      width: 50,
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
      width: 100,
      render: (quantity: number) => (
        <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-xs font-semibold">
          {quantity} ชิ้น
        </span>
      ),
    },
  ];

  // --- Styled Components ---
  const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="text-slate-500 text-xs sm:text-sm font-medium mb-1 flex items-center gap-2">
      {children}
    </div>
  );
  const Value: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="text-slate-800 text-sm sm:text-base break-words font-semibold pl-1">
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
      // ปรับ Modal ให้ Responsive ไม่ล้นจอ
      style={{ maxWidth: "95%", paddingBottom: 0 }}
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
          <div className="bg-white px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center sticky top-0 z-10 gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0683e9] m-0 flex items-center gap-2">
                ยืนยันการรับคืนอุปกรณ์
              </h2>
              <div className="text-slate-500 text-xs sm:text-sm mt-1">
                กรุณาตรวจสอบสภาพของและจำนวนก่อนยืนยัน
              </div>
            </div>
            <div className="self-end sm:self-auto">
              {getStatusTag(record.status)}
            </div>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
            {/* Info Card */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[16, 16]}>
                {/* --- ส่วนผู้ส่ง (ครึ่งซ้าย) --- */}
                <Col xs={24} sm={12}>
                  <Label>ผู้ส่งเครื่องมือ :</Label>
                  <Value>{record.createdBy || "-"}</Value>
                </Col>

                {/* --- ส่วนวันที่ (ครึ่งขวา) --- */}
                <Col xs={24} sm={12}>
                  <Label>วันที่ส่ง :</Label>
                  <Value>
                    {record.sentDate ? (
                      <>
                        <span className="md:hidden font-normal">
                          {dayjs(record.sentDate).format("D MMM BB")}
                        </span>
                        <span className="hidden md:block font-normal">
                          {dayjs(record.sentDate)
                            .locale("th")
                            .format("DD MMMM YYYY")}
                        </span>
                      </>
                    ) : (
                      "-"
                    )}
                  </Value>
                </Col>

                {/* --- ส่วนหมายเหตุ (เต็มความกว้างด้านล่าง) --- */}
                <Col xs={24} sm={24}>
                  <Label>หมายเหตุ :</Label>
                  <Value>
                    {/* ✅ แก้ไข: สร้าง div ครอบข้างใน แล้วใส่ class ที่นี่แทน */}
                    <div className="whitespace-pre-wrap break-words">
                      {record.note || "-"}
                    </div>
                  </Value>
                </Col>
              </Row>
            </div>

            {/* Table Card */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4 overflow-hidden">
              <h3 className="text-slate-800 font-semibold mb-4 text-sm sm:text-base pl-2 border-l-4 border-blue-500">
                รายการอุปกรณ์ที่ต้องรับคืน
              </h3>
              <CustomTable
                dataSource={record.items || []}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                bordered={false}
                // เพิ่ม Scroll แนวนอนรองรับมือถือ
                scroll={{ x: "max-content" }}
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

            {/* Note Input */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Label>หมายเหตุรับคืน :</Label>
              <Input.TextArea
                maxLength={150}
                rows={3}
                placeholder="ระบุหมายเหตุเพิ่มเติม เช่น อุปกรณ์ครบถ้วน, สภาพสมบูรณ์"
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                className="rounded-xl border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 mt-2 text-sm"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white px-4 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
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
