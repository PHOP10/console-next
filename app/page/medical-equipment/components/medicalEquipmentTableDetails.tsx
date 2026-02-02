"use client";

import React from "react";
import { Modal, Row, Col, Tag, Divider } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import type { ColumnsType } from "antd/es/table";
import CustomTable from "../../common/CustomTable";

interface Props {
  record: any;
  open: boolean;
  onClose: () => void;
}

export default function MedicalEquipmentTableDetails({
  record,
  open,
  onClose,
}: Props) {
  // --- 1. Helper Functions ---
  const formatDate = (
    dateString: string | null | undefined,
    includeTime = false,
  ) => {
    if (!dateString) return "-";
    const format = includeTime ? "DD MMM YY HH:mm น." : "DD MMM YYYY"; // ปรับ Format ให้สั้นลงเล็กน้อยถ้ามีเวลา
    return dayjs(dateString).locale("th").format(format);
  };

  const getStatusTag = (status: string) => {
    const baseStyle =
      "px-3 py-1 rounded-full text-xs sm:text-sm font-medium border-0";
    switch (status) {
      case "pending":
        return (
          <Tag color="blue" className={baseStyle}>
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
          <Tag color="default" className={baseStyle}>
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

  // --- 2. Table Columns Configuration ---
  const columns: ColumnsType<any> = [
    {
      title: "ลำดับ",
      key: "index",
      width: 50, // ลดความกว้างลง
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
        <span className="font-medium text-slate-700 text-sm sm:text-base">
          {text}
        </span>
      ),
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 80,
      render: (quantity: number) => (
        <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
          {quantity}
        </span>
      ),
    },
  ];

  // --- 3. Styled Components ---
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
      width={750}
      centered
      // ปรับให้เต็มจอในมือถือ
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
          {/* 🔹 Header */}
          <div className="bg-white px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center sticky top-0 z-10 gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 m-0">
                รายละเอียดการส่งเครื่องมือ
              </h2>
            </div>
            <div className="self-end sm:self-auto">
              {getStatusTag(record.status)}
            </div>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh]">
            {/* 🔹 Card 1: ข้อมูลทั่วไป */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={12}>
                  <Label>ผู้ส่งเครื่องมือ :</Label>
                  <Value isBold>{record.createdBy || "-"}</Value>
                </Col>
                <Col xs={12} sm={12}>
                  <Label>วันที่ส่ง :</Label>
                  <Value isBold>{formatDate(record.sentDate)}</Value>
                </Col>
              </Row>
            </div>

            {/* 🔹 Card 2: ตารางรายการ */}
            <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4 overflow-hidden">
              <h3 className="text-slate-800 font-semibold mb-3 text-sm sm:text-base pl-2 border-l-4 border-blue-500">
                รายการอุปกรณ์
              </h3>
              <CustomTable
                dataSource={record.items || []}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                bordered={false}
                // เพิ่ม scroll แนวนอน
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
                          fontSize: "13px",
                        }}
                      />
                    ),
                  },
                }}
              />
            </div>

            {record.note && (
              <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
                <Label>หมายเหตุ :</Label>
                <InfoBox text={record.note} />
              </div>
            )}
            {record.returnNote && (
              <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
                <Label>หมายเหตุรับคืน :</Label>
                <InfoBox text={record.returnNote} />
              </div>
            )}

            <div className="bg-slate-200/50 p-4 rounded-xl text-xs sm:text-sm border border-slate-200">
              <Row gutter={[16, 12]}>
                {/* กรณีอนุมัติ */}
                {record.approveBy && (
                  <>
                    <Col xs={12} sm={12}>
                      <span className="text-slate-500 block text-[10px] sm:text-xs uppercase tracking-wider mb-1">
                        ผู้อนุมัติ
                      </span>
                      <span className="text-slate-700 font-medium block">
                        {record.approveBy}
                      </span>
                    </Col>
                    <Col xs={12} sm={12}>
                      <span className="text-slate-500 block text-[10px] sm:text-xs uppercase tracking-wider mb-1">
                        วันที่อนุมัติ
                      </span>
                      <span className="text-slate-700 font-medium block">
                        {formatDate(record.approveAt)}
                      </span>
                    </Col>
                    <Divider className="my-2 bg-slate-300 col-span-2 opacity-50" />
                  </>
                )}

                {/* กรณีรับคืน */}
                {(record.returnName || record.returndAt) && (
                  <>
                    <Col xs={12} sm={12}>
                      <span className="text-blue-600 block text-[10px] sm:text-xs uppercase tracking-wider mb-1 font-semibold">
                        ผู้รับคืนเครื่องมือ
                      </span>
                      <span className="text-slate-700 font-medium block">
                        {record.returnName || "-"}
                      </span>
                    </Col>
                    <Col xs={12} sm={12}>
                      <span className="text-blue-600 block text-[10px] sm:text-xs uppercase tracking-wider mb-1 font-semibold">
                        วันที่รับคืน
                      </span>
                      <span className="text-slate-700 font-medium block">
                        {formatDate(record.returndAt)}
                      </span>
                    </Col>
                  </>
                )}

                {/* กรณียกเลิก */}
                {(record.nameReason || record.cancelReason) && (
                  <>
                    <Col xs={12} sm={12}>
                      <span className="text-red-500 block text-[10px] sm:text-xs uppercase tracking-wider mb-1 font-semibold">
                        ผู้ยกเลิก
                      </span>
                      <span className="text-slate-700 font-medium block">
                        {record.nameReason || "-"}
                      </span>
                    </Col>
                    <Col xs={12} sm={12}>
                      <span className="text-red-500 block text-[10px] sm:text-xs uppercase tracking-wider mb-1 font-semibold">
                        วันที่ยกเลิก
                      </span>
                      <span className="text-slate-700 font-medium block">
                        {formatDate(record.createdAt)}
                      </span>
                    </Col>
                    {record.cancelReason && (
                      <Col span={24} className="mt-1">
                        <div className="bg-red-50 p-2 rounded border border-red-100 text-red-700 text-xs">
                          เหตุผลยกเลิกก: {record.cancelReason}
                        </div>
                      </Col>
                    )}
                  </>
                )}
              </Row>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
