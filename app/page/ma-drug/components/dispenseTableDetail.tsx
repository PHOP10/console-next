"use client";

import React from "react";
import { Modal, Row, Col, Tag, Table } from "antd";
import { DispenseType } from "../../common"; // ✅ อย่าลืม Import Type
import dayjs from "dayjs";
import "dayjs/locale/th";
import type { ColumnsType } from "antd/es/table";

interface DispenseTableDetailProps {
  visible: boolean;
  onClose: () => void;
  data: DispenseType | null;
}

export default function DispenseTableDetail({
  visible,
  onClose,
  data,
}: DispenseTableDetailProps) {
  // --- Helper Functions ---
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return dayjs(dateString).locale("th").format("DD MMM YYYY ");
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
      case "approved":
        return (
          <Tag color="blue" className={baseStyle}>
            อนุมัติแล้ว
          </Tag>
        );
      case "completed":
        return (
          <Tag color="default" className={baseStyle}>
            จ่ายสำเร็จ
          </Tag>
        );
      case "canceled":
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
      width: 60,
      align: "center",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "รหัสยา",
      dataIndex: ["drug", "workingCode"],
      key: "workingCode",
      width: 100,
      render: (text) => (
        <span className="text-slate-500 font-mono">{text || "-"}</span>
      ),
    },
    {
      title: "ชื่อรายการยา",
      dataIndex: ["drug", "name"],
      key: "drugName",
      render: (text) => (
        <span className="font-medium text-slate-700">{text || "-"}</span>
      ),
    },
    {
      title: "ขนาด",
      dataIndex: ["drug", "packagingSize"],
      key: "packagingSize",
      width: 100,
      align: "center",
    },
    {
      title: "จำนวนจ่าย",
      dataIndex: "quantity",
      key: "quantity",
      width: 90,
      align: "center",
      render: (val) => <span className="font-bold text-red-600">{val}</span>, // สีแดงสื่อถึงการจ่ายออก
    },
    {
      title: "ราคา/หน่วย",
      dataIndex: "price", // ใช้ราคา Snapshot จาก DispenseItem
      width: 100,
      align: "right",
      render: (val) =>
        val?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "-",
    },
    {
      title: "รวมเงิน",
      key: "subtotal",
      width: 110,
      align: "right",
      render: (_, record) => {
        const total = (record.quantity || 0) * (record.price || 0);
        return (
          <span className="font-semibold">
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
      style={{ top: 20 }}
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
      <div className="flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800 m-0">
              รายละเอียดการจ่ายยา
            </h2>
            {/* <div className="text-slate-500 text-xs mt-1">
              ID:{" "}
              <span className="text-blue-600 font-mono font-bold">
                #{data.id}
              </span>
            </div> */}
          </div>
          <div>{getStatusTag(data.status)}</div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ข้อมูลทั่วไป (Header Info) */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-4">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Label>วันที่ทำรายการ</Label>
                <Value isBold>{formatDate(data.dispenseDate)}</Value>
              </Col>
              <Col xs={24} sm={8}>
                <Label>ผู้จ่ายยา</Label>
                <Value>{data.dispenserName || "-"}</Value>
              </Col>
            </Row>
          </div>

          {/* ตารางรายการยา (Table) */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-100/50 border-b border-slate-200 font-semibold text-slate-700 flex justify-between">
              <span>รายการยาที่จ่าย ({data.dispenseItems?.length || 0})</span>
            </div>

            <Table
              dataSource={data.dispenseItems || []}
              columns={drugColumns}
              rowKey="id"
              size="small"
              scroll={{ y: 400, x: 700 }}
              pagination={{
                pageSize: 20,
                showSizeChanger: false,
                size: "small",
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} จาก ${total} รายการ`,
              }}
              summary={() => {
                return (
                  <Table.Summary.Row className="bg-blue-50/50 font-bold">
                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                      รวมทั้งสิ้น (Grand Total)
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="center">
                      <span className="text-red-600">
                        {data.dispenseItems
                          ?.reduce((sum, item) => sum + item.quantity, 0)
                          .toLocaleString()}
                      </span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} colSpan={2} align="right">
                      <span className="text-blue-600 text-lg">
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
            <div className="mt-4 bg-yellow-50 p-3 rounded border border-yellow-200 text-sm text-yellow-800">
              <strong>หมายเหตุ:</strong> {data.note}
            </div>
          )}
        </div>

        {/* Footer (Fixed) */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </Modal>
  );
}
