"use client";

import React from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DataLeaveType } from "../../common";
import dayjs from "dayjs";

interface managementDataLeaveTableProps {
  data: DataLeaveType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function managementDataLeaveTable({
  data,
  loading,
}: managementDataLeaveTableProps) {
  const columns: ColumnsType<DataLeaveType> = [
    {
      title: "เหตุผล",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "วันที่เริ่มลา",
      dataIndex: "leaveDateStart",
      key: "leaveDateStart",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "วันที่สิ้นสุด",
      dataIndex: "leaveDateEnd",
      key: "leaveDateEnd",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "สถานะอนุมัติ",
      dataIndex: "approveStatus",
      key: "approveStatus",
      render: (status) => {
        let color = "default";
        if (status === "approved") color = "green";
        else if (status === "pending") color = "orange";
        else if (status === "rejected") color = "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "อนุมัติโดย",
      dataIndex: "approvedBy",
      key: "approvedBy",
      render: (value) => value || "-",
    },
    {
      title: "รายละเอียด",
      dataIndex: "details",
      key: "details",
      render: (value) => value || "-",
    },
    // {
    //   title: "สร้างเมื่อ",
    //   dataIndex: "createdAt",
    //   key: "createdAt",
    //   render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    // },
    // {
    //   title: "อัปเดตล่าสุด",
    //   dataIndex: "updatedAt",
    //   key: "updatedAt",
    //   render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    // },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
}
