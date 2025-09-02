"use client";

import React, { useState } from "react";
import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DataLeaveType } from "../../common";
import dayjs from "dayjs";
import DataLeaveDetail from "./dataLeaveDetail";

interface DataLeaveTableProps {
  data: DataLeaveType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DataLeaveTable({ data, loading }: DataLeaveTableProps) {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const handleShowDetail = (record: any) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRecord(null);
  };

  const columns: ColumnsType<DataLeaveType> = [
    {
      title: "เหตุผล",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "วันที่เริ่มลา",
      dataIndex: "dateStart",
      key: "dateStart",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "วันที่สิ้นสุด",
      dataIndex: "dateEnd",
      key: "dateEnd",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = "";

        switch (status) {
          case "pending":
            color = "blue";
            text = "รอดำเนินการ";
            break;
          case "approve":
            color = "green";
            text = "อนุมัติ";
            break;
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
      title: "ผู้อนุมัติ",
      dataIndex: "approvedById",
      key: "approvedById",
      render: (value) => value || "-",
    },
    {
      title: "รายละเอียด",
      dataIndex: "details",
      key: "details",
      render: (value) => value || "-",
    },

    {
      title: "จัดการ",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          size="small"
          type="primary"
          onClick={() => handleShowDetail(record)}
        >
          รายละเอียด
        </Button>
      ),
    },
    // {
    //   title: "อัปเดตล่าสุด",
    //   dataIndex: "updatedAt",
    //   key: "updatedAt",
    //   render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    // },
  ];

  return (
    <>
      <DataLeaveDetail
        open={detailModalOpen}
        onClose={handleCloseDetail}
        record={selectedRecord}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </>
  );
}
