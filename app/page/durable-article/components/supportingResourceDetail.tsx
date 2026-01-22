"use client";

import React from "react";
import { Modal, Row, Col, Divider, Tag } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { SupportingResourceType } from "../../common";

interface Props {
  open: boolean;
  onClose: () => void;
  record?: SupportingResourceType | null;
}

export default function SupportingResourceDetail({
  open,
  onClose,
  record,
}: Props) {
  // --- 1. Helper Functions ---
  const formatDate = (
    dateString: string | null | undefined,
    includeTime = false,
  ) => {
    if (!dateString) return "-";
    const format = includeTime ? "DD MMM YYYY เวลา HH:mm น." : "DD MMM YYYY";
    return dayjs(dateString).locale("th").format(format);
  };

  // --- 2. Styled Components (Reusable) ---
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
      className={`text-slate-800 text-sm sm:text-base break-words ${
        isBold ? "font-semibold" : ""
      }`}
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
      {record ? (
        <div className="flex flex-col">
          {/* 🔹 Header */}
          <div className="bg-white px-6 py-5 border-b border-slate-200 sticky top-0 z-10">
            <h2 className="text-xl font-bold text-slate-800 m-0">
              รายละเอียดวัสดุสนับสนุน
            </h2>
            <div className="text-slate-500 text-sm mt-1">
              รหัสวัสดุ:{" "}
              <span className="text-blue-600 font-semibold">
                {record.code || "-"}
              </span>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[75vh]">
            {/* 🔹 Card 1: ข้อมูลทั่วไป (ชื่อ, รายละเอียด) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[24, 20]}>
                <Col span={24}>
                  <Label>ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ :</Label>
                  <InfoBox text={record.name} />
                </Col>
              </Row>
            </div>

            {/* 🔹 Card 2: การได้มา & วันที่ (Acquisition) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <h3 className="text-slate-800 font-semibold mb-4 text-base pl-2">
                ข้อมูลการได้มา
              </h3>

              <Row gutter={[24, 20]}>
                <Col xs={24} sm={12}>
                  <Label>วัน เดือน ปี ที่ได้มา :</Label>
                  <Value isBold>{formatDate(record.acquiredDate)}</Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>วิธีการได้มา :</Label>
                  <Value>{record.acquisitionType || "-"}</Value>
                </Col>
              </Row>
            </div>

            {/* 🔹 Card 3: หมายเหตุ (Description) */}
            {record.description && (
              <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl mb-4">
                <Label>หมายเหตุ :</Label>
                <div className="text-amber-900 mt-1 text-sm whitespace-pre-wrap">
                  {record.description}
                </div>
              </div>
            )}

            {/* 🔹 Footer: System Info (Created/Updated) */}
            <div className="bg-slate-200/50 p-4 rounded-xl text-sm border border-slate-200">
              <Row gutter={[16, 12]}>
                <Col xs={24} sm={12}>
                  <span className="text-slate-500 block text-xs">
                    ผู้เพิ่มข้อมูล
                  </span>
                  <span className="text-slate-700 font-medium">
                    {record.createdBy || "-"}
                  </span>
                </Col>
                <Col xs={24} sm={12}>
                  <span className="text-slate-500 block text-xs">
                    วันที่เพิ่มข้อมูล
                  </span>
                  <span className="text-slate-700 font-medium">
                    {formatDate(record.createdAt)}
                  </span>
                </Col>

                <Divider className="my-2 bg-slate-300 col-span-2" />

                <Col span={24} className="text-right text-xs text-slate-400">
                  แก้ไขล่าสุดเมื่อ: {formatDate(record.updatedAt, true)}
                </Col>
              </Row>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center text-slate-400">ไม่พบข้อมูล</div>
      )}
    </Modal>
  );
}
