"use client";

import React from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { OfficialTravelRequestType } from "../../common";

interface Props {
  data: OfficialTravelRequestType[];
  loading: boolean;
  fetchData: () => void;
}

const OfficialTravelRequestTable: React.FC<Props> = ({ data, loading }) => {
  const columns: ColumnsType<OfficialTravelRequestType> = [
    {
      title: "เลขที่เอกสาร",
      dataIndex: "documentNo",
      key: "documentNo",
    },
    {
      title: "เรื่อง",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "รายละเอียดภารกิจ",
      dataIndex: "missionDetail",
      key: "missionDetail",
    },
    {
      title: "สถานที่",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "วันที่เริ่ม",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "วันที่สิ้นสุด",
      dataIndex: "endDate",
      key: "endDate",
      render: (text) => new Date(text).toLocaleDateString(),
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
      title: "รถที่ใช้",
      dataIndex: ["MasterCar", "licensePlate"],
      key: "car",
      render: (_, record) =>
        record.MasterCar
          ? `${record.MasterCar.licensePlate} (${record.MasterCar.brand} ${record.MasterCar.model})`
          : "-",
    },
    {
      title: "ผู้อนุมัติ",
      dataIndex: "approvedByName",
      key: "approvedByName",
      render: (text) => text || "-",
    },
  ];

  return (
    <Table rowKey="id" columns={columns} dataSource={data} loading={loading} />
  );
};

export default OfficialTravelRequestTable;
