"use client";

import React, { useState } from "react";
import { Table, Space, Popconfirm, Button, message, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { maCarService } from "../services/maCar.service";
import { MaCarType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import MaCarDetail from "./maCarDetail";
import MaCarExportWord from "./maCarExport";
import MaCarEditModal from "./MaCarEditModal";

interface MaCarTableProps {
  data: MaCarType[];
  loading: boolean;
  fetchData: () => void;
}

const MaCarTable: React.FC<MaCarTableProps> = ({
  data,
  loading,
  fetchData,
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);

  const handleShowDetail = (record: any) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRecord(null);
  };

  const handleEdit = (record: any) => {
    setEditRecord(record);
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditRecord(null);
  };

  const handleUpdate = async (values: any) => {
    await intraAuthService.updateMaCar(values); // 👈 ต้องมีใน service
    fetchData();
  };

  const columns: ColumnsType<MaCarType> = [
    { title: "ผู้ขอใช้รถ", dataIndex: "requesterName", key: "requesterName" },
    { title: "วัตถุประสงค์", dataIndex: "purpose", key: "purpose" },
    {
      title: "วันเริ่มเดินทาง",
      dataIndex: "dateStart",
      key: "dateStart",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },
    {
      title: "วันกลับ",
      dataIndex: "dateEnd",
      key: "dateEnd",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },
    { title: "ปลายทาง", dataIndex: "destination", key: "destination" },
    { title: "จำนวนผู้โดยสาร", dataIndex: "passengers", key: "passengers" },
    {
      title: "งบประมาณ",
      dataIndex: "budget",
      key: "budget",
      render: (value) => (value ? value.toLocaleString() : "-"),
    },
    { title: "รหัสรถ", dataIndex: "masterCarId", key: "masterCarId" },
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
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="primary"
            style={{
              backgroundColor:
                record.status === "pending" ? "#faad14" : "#d9d9d9",
              borderColor: record.status === "pending" ? "#faad14" : "#d9d9d9",
              color: record.status === "pending" ? "white" : "#888",
              cursor: record.status === "pending" ? "pointer" : "not-allowed",
            }}
            disabled={record.status !== "pending"}
            onClick={() => handleEdit(record)}
          >
            แก้ไข
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => handleShowDetail(record)}
          >
            รายละเอียด
          </Button>
          <MaCarExportWord record={record} />
        </Space>
      ),
    },
  ];

  return (
    <>
      {" "}
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 800 }}
      />{" "}
      <MaCarDetail
        open={detailModalOpen}
        onClose={handleCloseDetail}
        record={selectedRecord}
      />
      <MaCarEditModal
        open={editModalOpen}
        onClose={handleCloseEdit}
        record={editRecord}
        cars={[]} // 👈 ส่ง cars มาจาก props
        dataUser={[]} // 👈 ส่ง user list มาจาก props
        onUpdate={handleUpdate}
      />
    </>
  );
};

export default MaCarTable;
