"use client";

import React from "react";
import { Modal, Table, Row, Col, Tag, Divider } from "antd";
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
    const format = includeTime ? "DD MMMM YYYY HH:mm น." : "DD MMMM YYYY";
    return dayjs(dateString).locale("th").format(format);
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

  // --- 2. Table Columns Configuration ---
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
          {/* 🔹 Header */}
          <div className="bg-white px-6 py-5 border-b border-slate-200 flex justify-between items-start sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800 m-0">
                รายละเอียดการส่งเครื่องมือ
              </h2>
              <div className="text-slate-500 text-sm mt-1">
                ตรวจสอบรายการเครื่องมือแพทย์ที่ส่ง
              </div>
            </div>
            <div className="text-right">{getStatusTag(record.status)}</div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[75vh]">
            {/* 🔹 Card 1: ข้อมูลทั่วไป (ผู้ส่ง, วันที่) */}
            <div className="bg-white  rounded-xl shadow-sm border border-slate-100 mb-4">
              <Row gutter={[24, 20]}>
                <Col xs={24} sm={12}>
                  <Label>ผู้ส่ง :</Label>
                  <Value isBold>{record.createdBy || "-"}</Value>
                </Col>
                <Col xs={24} sm={12}>
                  <Label>วันที่ส่ง :</Label>
                  <Value isBold>{formatDate(record.sentDate)}</Value>
                </Col>
              </Row>
            </div>

            {/* 🔹 Card 2: ตารางรายการ (Table Section) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4 overflow-hidden">
              <h3 className="text-slate-800 font-semibold mb-4 text-base pl-2 border-l-4 border-blue-500">
                รายการอุปกรณ์
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

            {record.note && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
                <Label>หมายเหตุ :</Label>
                <InfoBox text={record.note} />
              </div>
            )}

            <div className="bg-slate-200/50 p-4 rounded-xl text-sm border border-slate-200">
              <Row gutter={[16, 12]}>
                {/* กรณีอนุมัติ */}
                {record.approveBy && (
                  <>
                    <Col xs={24} sm={12}>
                      <span className="text-slate-500 block text-xs">
                        ผู้อนุมัติ
                      </span>
                      <span className="text-slate-700 font-medium">
                        {record.approveBy}
                      </span>
                    </Col>
                    <Col xs={24} sm={12}>
                      <span className="text-slate-500 block text-xs">
                        วันที่อนุมัติ
                      </span>
                      <span className="text-slate-700 font-medium">
                        {formatDate(record.approveAt)}
                      </span>
                    </Col>
                    <Divider className="my-2 bg-slate-300 col-span-2" />
                  </>
                )}

                {/* กรณีรับคืน */}
                {(record.returnName || record.returndAt) && (
                  <>
                    <Col xs={24} sm={12}>
                      <span className="text-blue-600 block text-xs font-semibold">
                        ผู้รับคืน
                      </span>
                      <span className="text-slate-700 font-medium">
                        {record.returnName || "-"}
                      </span>
                    </Col>
                    <Col xs={24} sm={12}>
                      <span className="text-blue-600 block text-xs font-semibold">
                        วันที่รับคืน
                      </span>
                      <span className="text-slate-700 font-medium">
                        {formatDate(record.returndAt)}
                      </span>
                    </Col>
                  </>
                )}

                {/* กรณียกเลิก */}
                {(record.nameReason || record.cancelReason) && (
                  <>
                    <Col xs={24} sm={12}>
                      <span className="text-red-500 block text-xs font-semibold">
                        ผู้ยกเลิก
                      </span>
                      <span className="text-slate-700 font-medium">
                        {record.nameReason || "-"}
                      </span>
                    </Col>
                    <Col xs={24} sm={12}>
                      <span className="text-red-500 block text-xs font-semibold">
                        วันที่ยกเลิก
                      </span>
                      <span className="text-slate-700 font-medium">
                        {formatDate(record.createdAt)}
                      </span>
                    </Col>
                    {record.cancelReason && (
                      <Col span={24} className="mt-2">
                        <div className="bg-white p-2 rounded border border-red-100 text-red-600 text-xs">
                          เหตุผล: {record.cancelReason}
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
