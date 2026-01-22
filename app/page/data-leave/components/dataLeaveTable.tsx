"use client";

import React, { useState } from "react";
import { Form, Space, Table, Tag, Tooltip, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import dayjs from "dayjs";
import DataLeaveDetail from "./dataLeaveDetail";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveService } from "../services/dataLeave.service";
import DataLeaveWord from "./dataLeaveWord";
import {
  EditOutlined,
  FileSearchOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { User } from "next-auth";
import DataLeaveEdit from "./dataLeaveEdit";
import CustomTable from "../../common/CustomTable";

interface DataLeaveTableProps {
  data: DataLeaveType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  masterLeaves: MasterLeaveType[];
  fetchData: () => Promise<void>;
  leaveByUserId: DataLeaveType[];
  user: UserType[];
}

export default function DataLeaveTable({
  data,
  loading,
  masterLeaves,
  fetchData,
  leaveByUserId,
  user,
}: DataLeaveTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<DataLeaveType | null>(
    null,
  );
  const [dataLeave, setDataLeave] = useState<DataLeaveType[]>(leaveByUserId);

  const handleShowDetail = (record: any) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRecord(null);
  };

  const openEditModal = (record: DataLeaveType) => {
    setCurrentRecord(record);
    setIsEditOpen(true);
  };

  const handleUpdate = (updated: any) => {
    setDataLeave((prev) =>
      prev.map((item: any) =>
        item.id === updated.id ? { ...item, ...updated } : item,
      ),
    );
  };

  const columns: ColumnsType<DataLeaveType> = [
    {
      title: "ชื่อผู้ลา",
      dataIndex: "createdName",
      key: "createdName",
      align: "center",
    },
    {
      title: "เหตุผลการลา",
      dataIndex: "reason",
      key: "reason",
      align: "center",
      render: (text: string) => {
        const maxLength = 25;
        if (!text) return "-";
        return text.length > maxLength ? (
          <Tooltip placement="topLeft" title={text}>
            {text.slice(0, maxLength) + "..."}
          </Tooltip>
        ) : (
          text
        );
      },
    },
    {
      title: "ตั้งแต่วันที่",
      dataIndex: "dateStart",
      key: "dateStart",
      align: "center",
      render: (text: string) => {
        const date = new Date(text);
        return new Intl.DateTimeFormat("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(date);
      },
    },
    {
      title: "ถึงวันที่",
      dataIndex: "dateEnd",
      key: "dateEnd",
      align: "center",
      render: (text: string) => {
        const date = new Date(text);
        return new Intl.DateTimeFormat("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(date);
      },
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        let color = "default";
        let text = "";

        switch (status) {
          case "pending":
            color = "blue";
            text = "รออนุมัติ";
            break;
          case "edit":
            color = "orange";
            text = "รอแก้ไข";
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
      title: "หมายเหตุเพิ่มเติม",
      dataIndex: "details",
      key: "details",
      align: "center",
      ellipsis: true,
      render: (text: string) => {
        const maxLength = 15;
        if (!text) return "-";
        return text.length > maxLength ? (
          <Tooltip placement="topLeft" title={text}>
            {text.slice(0, maxLength) + "..."}
          </Tooltip>
        ) : (
          text
        );
      },
    },

    {
      title: "จัดการ",
      key: "action",
      align: "center",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="แก้ไข">
            <EditOutlined
              style={{
                fontSize: 22,
                color:
                  record.status === "pending" || record.status === "edit"
                    ? "#faad14"
                    : "#d9d9d9",
                cursor:
                  record.status === "pending" || record.status === "edit"
                    ? "pointer"
                    : "not-allowed",
                opacity:
                  record.status === "pending" || record.status === "edit"
                    ? 1
                    : 0.6,
              }}
              onClick={() => {
                if (record.status === "pending" || record.status === "edit") {
                  openEditModal(record);
                }
              }}
            />
          </Tooltip>

          <Tooltip title="รายละเอียด">
            <FileSearchOutlined
              style={{ fontSize: 22, color: "#1677ff", cursor: "pointer" }}
              onClick={() => handleShowDetail(record)}
            />
          </Tooltip>

          <DataLeaveWord record={record} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          textAlign: "center",
          fontSize: "20px",
          fontWeight: "bold",
          color: "#0683e9",
          marginTop: "-12px",

          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "12px",
          marginBottom: "24px",

          marginLeft: "-24px",
          marginRight: "-24px",
        }}
      >
        ข้อมูลการลา
      </div>

      <DataLeaveDetail
        open={detailModalOpen}
        onClose={handleCloseDetail}
        record={selectedRecord}
        user={user}
      />
      <Row gutter={[24, 24]}>
        <CustomTable
          rowKey="id"
          columns={columns}
          dataSource={leaveByUserId}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "800" }}
        />
      </Row>
      <DataLeaveEdit
        open={isEditOpen}
        record={currentRecord}
        masterLeaves={masterLeaves}
        onClose={() => {
          setIsEditOpen(false);
        }}
        onUpdate={handleUpdate}
        fetchData={fetchData}
        leaveByUserId={leaveByUserId}
        user={user}
        formEdit={formEdit}
      />
    </>
  );
}
