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
import "dayjs/locale/th";

// Set locale globally
dayjs.locale("th");

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
      width: 150,
    },
    {
      title: "เหตุผลการลา",
      dataIndex: "reason",
      key: "reason",
      align: "center",
      width: 150,
      responsive: ["lg"],
      render: (text: string) => {
        const maxLength = 25;
        if (!text) return "-";
        return text.length > maxLength ? (
          <Tooltip placement="topLeft" title={text}>
            <span style={{ fontWeight: "normal" }}>
              {text.slice(0, maxLength) + "..."}
            </span>
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
      width: 120,
      render: (text: string) => {
        if (!text) return "-";
        const dateObj = dayjs(text);
        return (
          <>
            <span className="md:hidden font-normal">
              {dateObj.format("D MMM BB")}
            </span>

            <span className="hidden md:block font-normal">
              {dateObj.locale("th").format("D MMMM BBBB")}
            </span>
          </>
        );
      },
    },
    {
      title: "ถึงวันที่",
      dataIndex: "dateEnd",
      key: "dateEnd",
      align: "center",
      width: 120,
      render: (text: string) => {
        if (!text) return "-";
        const dateObj = dayjs(text);
        return (
          <>
            <span className="md:hidden font-normal">
              {dateObj.format("D MMM BB")}
            </span>
            <span className="hidden md:block font-normal">
              {dateObj.locale("th").format("D MMMM BBBB")}
            </span>
          </>
        );
      },
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 100,
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
          case "success":
            color = "default";
            text = "เสร็จสิ้น";
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
      width: 150,
      ellipsis: true,
      responsive: ["md"], // ซ่อนบนมือถือ
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
      width: 140, // เพิ่มความกว้างเล็กน้อยสำหรับปุ่ม
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="รายละเอียด">
            <FileSearchOutlined
              style={{ fontSize: 18, color: "#1677ff", cursor: "pointer" }} // ปรับขนาดไอคอนเป็น 18px
              onClick={() => handleShowDetail(record)}
            />
          </Tooltip>

          {/* ปรับขนาดไอคอนใน DataLeaveWord ด้วยถ้าทำได้ หรือปล่อยไว้ถ้าเป็น component แยก */}
          <div style={{ transform: "scale(0.9)" }}>
            <DataLeaveWord record={record} />
          </div>

          <Tooltip title="แก้ไข">
            <EditOutlined
              style={{
                fontSize: 18, // ปรับขนาดไอคอนเป็น 18px
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
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-2 tracking-tight">
          ตารางข้อมูลการลา
        </h2>
        <hr className="border-slate-100/20 -mx-6 md:-mx-6" />
      </div>

      <div className="p-3 pt-1">
        <DataLeaveDetail
          open={detailModalOpen}
          onClose={handleCloseDetail}
          record={selectedRecord}
          user={user}
        />

        <CustomTable
          rowKey="id"
          columns={columns}
          dataSource={leaveByUserId}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }} // เพิ่ม scroll แนวนอน
          bordered
          size="small" // ใช้ size small บนมือถือ
        />

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
      </div>
    </>
  );
}
