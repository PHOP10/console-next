"use client";

import React from "react";
import { Modal, Row, Col, Tag, Divider } from "antd";
import { MaDrugType } from "../../common";
import dayjs from "dayjs";
import "dayjs/locale/th";

interface MaDrugTableDetailProps {
  visible: boolean;
  onClose: () => void;
  data: MaDrugType | null;
}

export default function MaDrugTableDetail({
  visible,
  onClose,
  data,
}: MaDrugTableDetailProps) {
  // --- 1. Helper Functions ---
  const formatDate = (
    dateString: string | null | undefined,
    includeTime = false,
  ) => {
    if (!dateString) return "-";
    const format = includeTime ? "DD MMM YYYY เวลา HH:mm น." : "DD MMM YYYY";
    return dayjs(dateString).locale("th").format(format);
  };

  const getStatusTag = (status: string) => {
    const baseStyle = "px-3 py-1 rounded-full text-sm font-medium border-0";
    switch (status) {
      case "pending":
        return (
          <Tag color="blue" className={baseStyle}>
            รออนุมัติ
          </Tag>
        );
      case "approved":
        return (
          <Tag color="green" className={baseStyle}>
            อนุมัติแล้ว
          </Tag>
        );
      case "completed":
        return (
          <Tag
            color="grey"
            className={`bg-slate-100 text-slate-600 border border-slate-200 ${baseStyle}`}
          >
            รับยาแล้ว
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

  // --- 2. Styled Components ---
  const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="text-slate-500 text-xs sm:text-sm font-medium mb-1">
      {children}
    </div>
  );

  const Value: React.FC<{ children: React.ReactNode; isBold?: boolean }> = ({
    children,
    isBold,
  }) => (
    <div
      className={`text-slate-800 text-sm sm:text-base break-words ${isBold ? "font-semibold" : ""}`}
    >
      {children}
    </div>
  );

  const InfoBox: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return <Value>-</Value>;
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    );
  };

  if (!data) return null;

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null} // ✅ ซ่อนปุ่มด้านล่างตามที่ขอ
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
      <div className="flex flex-col">
        {/* 🔹 Header */}
        <div className="bg-white px-6 py-5 border-b border-slate-200 flex justify-between items-start sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800 m-0">
              รายละเอียดการเบิกจ่ายยา
            </h2>
            <div className="text-slate-500 text-sm mt-1">
              เลขที่ใบเบิก:{" "}
              <span className="text-blue-600 font-semibold">
                {data.requestNumber || "-"}
              </span>
            </div>
          </div>
          <div className="text-right">{getStatusTag(data.status)}</div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {/* 🔹 Card 1: ข้อมูลทั่วไป */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
            <Row gutter={[24, 20]}>
              <Col xs={24} sm={12}>
                <Label>หน่วยงาน :</Label>
                <Value isBold>{data.requestUnit || "-"}</Value>
              </Col>
              <Col xs={24} sm={12}>
                <Label>ผู้ขอเบิก :</Label>
                <Value isBold>{data.requesterName || "-"}</Value>
              </Col>

              <Divider className="my-0 col-span-2" dashed />

              <Col xs={24} sm={12}>
                <Label>วันที่ขอเบิก :</Label>
                <Value>{formatDate(data.requestDate)}</Value>
              </Col>
              <Col xs={24} sm={12}>
                <Label>เบิกครั้งที่ :</Label>
                <Value>{data.roundNumber}</Value>
              </Col>
            </Row>
          </div>

          {/* 🔹 Card 2: รายละเอียดรายการ */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
            <h3 className="text-slate-800 font-semibold mb-4 text-base pl-2">
              สรุปรายการเบิก
            </h3>

            <Row gutter={[24, 20]}>
              <Col xs={24} sm={12}>
                <Label>จำนวนรายการที่เบิก :</Label>
                <Value>{data.quantityUsed || 0} รายการ</Value>
              </Col>
              <Col xs={24} sm={12}>
                <Label>ราคารวม :</Label>
                <div className="text-blue-500 font-bold text-lg">
                  {data.totalPrice
                    ? data.totalPrice.toLocaleString("th-TH", {
                        style: "currency",
                        currency: "THB",
                      })
                    : "0.00 ฿"}
                </div>
              </Col>
            </Row>
          </div>

          {/* 🔹 Note (ถ้ามี) */}
          {data.note && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-4">
              <Label>หมายเหตุ :</Label>
              <div className="text-amber-900 mt-1 text-sm whitespace-pre-wrap">
                {data.note}
              </div>
            </div>
          )}

          {/* 🔹 Footer System Info */}
          <div className="bg-slate-200/50 p-4 rounded-xl text-sm border border-slate-200 text-right text-slate-400 text-xs">
            วันที่ทำรายการ: {formatDate(data.createdAt, true)}
          </div>
        </div>
      </div>
    </Modal>
  );
}
