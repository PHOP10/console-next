"use client";

import React from "react";
import { Modal, Row, Col, Tag, Table, Grid } from "antd";
import { MaDrugType } from "../../common";
import dayjs from "dayjs";
import "dayjs/locale/th";
import type { ColumnsType } from "antd/es/table";

const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();

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
      width: 50,
      align: "center",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "รหัสยา",
      dataIndex: ["drug", "workingCode"],
      key: "workingCode",
      width: 90,
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
        // ✅ เพิ่ม whitespace-normal และ break-words เพื่อให้ชื่อยายาวๆ ตัดขึ้นบรรทัดใหม่ได้
        <div className="font-medium text-slate-700 text-sm sm:text-base whitespace-normal break-words min-w-[150px]">
          {text}
        </div>
      ),
    },
    {
      title: "ขนาด",
      dataIndex: ["drug", "packagingSize"],
      key: "packagingSize",
      width: 90,
      align: "center",
      responsive: ["sm"],
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
      dataIndex: "price",
      width: 100,
      align: "right",
      responsive: ["sm"],
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
              <Col xs={24} sm={12} md={6}>
                <Label>หน่วยงาน</Label>
                <Value isBold>{data.requestUnit}</Value>
              </Col>
              <Col xs={12} sm={12} md={6}>
                <Label>ผู้ขอเบิก</Label>
                <Value>{data.requesterName}</Value>
              </Col>
              <Col xs={12} sm={12} md={6}>
                <Label>เบิกครั้งที่</Label>
                <Value>{data.roundNumber || "-"}</Value>
              </Col>
              <Col xs={12} sm={12} md={6}>
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
              // ✅ เปลี่ยน scroll x ให้เป็นตัวเลข เพื่อให้บน Desktop ไม่มีแถบเลื่อนซ้ายขวา แต่บนจอเล็ก(มือถือ)ยังเลื่อนได้ปกติ
              scroll={{ x: 600, y: 400 }}
              pagination={{
                pageSizeOptions: ["10", "20", "50", "100"],
                showSizeChanger: true,
                defaultPageSize: 20,
                showTotal: (total, range) => (
                  <span className="text-gray-500 text-xs sm:text-sm font-light">
                    แสดง {range[0]}-{range[1]} จากทั้งหมด{" "}
                    <span className="font-bold text-blue-600">{total}</span>{" "}
                    รายการ
                  </span>
                ),
                locale: { items_per_page: "/ หน้า" },
                position: ["bottomRight"],
              }}
              summary={() => {
                const labelColSpan = screens.md ? 4 : 3;
                const priceColSpan = screens.md ? 2 : 1;

                return (
                  <Table.Summary.Row className="bg-blue-50/50 font-bold text-xs sm:text-sm">
                    <Table.Summary.Cell
                      index={0}
                      colSpan={labelColSpan}
                      align="right"
                    >
                      รวมทั้งสิ้น
                    </Table.Summary.Cell>

                    <Table.Summary.Cell index={1} align="center">
                      <span className="text-blue-600">
                        {data.maDrugItems
                          ?.reduce((sum, item) => sum + item.quantity, 0)
                          .toLocaleString()}
                      </span>
                    </Table.Summary.Cell>

                    <Table.Summary.Cell
                      index={2}
                      colSpan={priceColSpan}
                      align="right"
                    >
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

        {/* Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium transition-colors text-sm"
          >
            ปิด
          </button>
        </div>
      </div>
    </Modal>
  );
}
