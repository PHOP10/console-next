"use client";

import React from "react";
import { Modal, Row, Col, Tag, Divider, Table } from "antd";
import { MaDrugType } from "../../common";
import dayjs from "dayjs";
import "dayjs/locale/th";
import type { ColumnsType } from "antd/es/table";

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
  // --- Helper Functions ---
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return dayjs(dateString).locale("th").format("DD MMMM YYYY");
  };

  const getStatusTag = (status: string) => {
    const baseStyle =
      "px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border-0";
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
          <Tag color="default" className={baseStyle}>
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
      className={`text-slate-800 text-sm break-words ${
        isBold ? "font-semibold" : ""
      }`}
    >
      {children}
    </div>
  );

  // --- Columns Definition ---
  const drugColumns: ColumnsType<any> = [
    {
      title: "ลำดับ",
      key: "index",
      width: 50, // ลดความกว้าง
      align: "center",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "รหัสยา",
      dataIndex: ["drug", "workingCode"],
      key: "workingCode",
      width: 80,
      render: (text) => (
        <span className="text-slate-500 font-mono text-xs sm:text-sm">
          {text}
        </span>
      ),
    },
    {
      title: "ชื่อรายการยา",
      dataIndex: ["drug", "name"],
      key: "drugName",
      render: (text) => (
        <span className="font-medium text-slate-700 text-sm sm:text-base">
          {text}
        </span>
      ),
    },
    {
      title: "ขนาด",
      dataIndex: ["drug", "packagingSize"],
      key: "packagingSize",
      width: 80,
      align: "center",
      responsive: ["sm"], // ซ่อนบนมือถือ
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      align: "center",
      render: (val) => <span className="font-bold text-blue-600">{val}</span>,
    },
    {
      title: "ราคา/หน่วย",
      // ❌ ของเดิม: dataIndex: ["drug", "price"],  <-- ผิด: ดึงราคาปัจจุบัน
      // ✅ แก้เป็น: dataIndex: "price",             <-- ถูก: ดึงราคาที่บันทึกไว้ในรายการ
      dataIndex: "price",
      width: 90,
      align: "right",
      responsive: ["sm"],
      render: (val) =>
        val?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "-",
    },
    {
      title: "รวมเงิน",
      key: "subtotal",
      width: 100,
      align: "right",
      render: (_, record) => {
        const total = (record.quantity || 0) * (record.price || 0);
        return (
          <span className="font-semibold text-sm">
            {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
  ];

  if (!data) return null;

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      style={{ top: 20, maxWidth: "100%", paddingBottom: 0 }}
      modalRender={(modal) => (
        <div className="bg-slate-50 rounded-lg overflow-hidden shadow-xl font-sans">
          {modal}
        </div>
      )}
      styles={{
        body: { padding: 0 },
        header: { display: "none" },
      }}
    >
      <div className="flex flex-col h-[85vh] sm:h-[80vh]">
        {/* Header */}
        <div className="bg-white px-4 sm:px-6 py-4 border-b border-slate-200 flex justify-between items-start sm:items-center shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 m-0">
              รายละเอียดใบเบิกยา
            </h2>
            <div className="text-slate-500 text-xs mt-1">
              เลขที่เบิก:{" "}
              <span className="text-blue-600 font-mono font-bold">
                {data.requestNumber}
              </span>
            </div>
          </div>
          <div>{getStatusTag(data.status)}</div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* ข้อมูลทั่วไป */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-4">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Label>หน่วยงาน</Label>
                <Value isBold>{data.requestUnit}</Value>
              </Col>
              <Col xs={12} sm={8}>
                <Label>ผู้ขอเบิก</Label>
                <Value>{data.requesterName}</Value>
              </Col>
              <Col xs={12} sm={8}>
                <Label>วันที่ทำรายการ</Label>
                <Value>{formatDate(data.requestDate)}</Value>
              </Col>
            </Row>
          </div>

          {/* ตารางรายการยา */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-4">
            <div className="px-4 py-3 bg-slate-100/50 border-b border-slate-200 font-semibold text-slate-700 text-sm">
              รายการยา ({data.maDrugItems?.length || 0})
            </div>

            <Table
              dataSource={data.maDrugItems || []}
              columns={drugColumns}
              rowKey="id"
              size="small"
              // Scroll แนวนอน + แนวตั้ง
              scroll={{ x: "max-content", y: 400 }}
              pagination={{ pageSize: 10, size: "small" }}
              summary={() => {
                return (
                  <Table.Summary.Row className="bg-blue-50/50 font-bold text-xs sm:text-sm">
                    <Table.Summary.Cell index={0} colSpan={3} align="right">
                      รวมทั้งสิ้น
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="center">
                      <span className="text-blue-600">
                        {data.maDrugItems
                          ?.reduce((sum, item) => sum + item.quantity, 0)
                          .toLocaleString()}
                      </span>
                    </Table.Summary.Cell>
                    {/* ปรับ colSpan ตาม Responsive Column ที่ซ่อนไป */}
                    <Table.Summary.Cell index={2} colSpan={3} align="right">
                      <span className="text-blue-600 text-sm sm:text-lg">
                        {data.totalPrice?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}{" "}
                        บาท
                      </span>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>

          {/* หมายเหตุ */}
          {data.note && (
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs sm:text-sm text-yellow-800">
              <strong>หมายเหตุ:</strong> {data.note}
            </div>
          )}
        </div>

        {/* {data.status === "cancel" && data.cancelReason && (
          <div className="bg-red-50 p-3 rounded border border-red-200 text-xs sm:text-sm text-red-800">
            <strong>สาเหตุที่ยกเลิก:</strong> {data.cancelReason} <br />
            <span className="text-xs text-red-600">
              (โดย: {data.cancelName || "-"})
            </span>
          </div>
        )} */}

        {/* Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium transition-colors text-sm"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </Modal>
  );
}
