"use client";

import React from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DataLeaveType } from "../../common";
import dayjs from "dayjs";

interface DataLeaveTableProps {
  data: DataLeaveType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DataLeaveTable({ data, loading }: DataLeaveTableProps) {
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
