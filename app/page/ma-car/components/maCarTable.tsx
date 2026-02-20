"use client";

import React, { useState } from "react";
import { Table, Space, Popconfirm, Button, message, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { maCarService } from "../services/maCar.service";
import { MaCarType, MasterCarType, UserType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import MaCarDetail from "./maCarDetail";
import MaCarExportWord from "./maCarExport";
import MaCarEditModal from "./MaCarEditModal";
import { useSession } from "next-auth/react";
import {
  CarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  FileSearchOutlined,
  FormOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import CustomTable from "../../common/CustomTable";
import MaCarReturn from "./maCarReturn";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Setup dayjs
dayjs.extend(buddhistEra);
dayjs.locale("th");

interface MaCarTableProps {
  data: MaCarType[];
  loading: boolean;
  fetchData: () => void;
  dataUser: UserType[];
  cars: MasterCarType[];
  maCarUser: MaCarType[];
}

const MaCarTable: React.FC<MaCarTableProps> = ({
  data,
  loading,
  fetchData,
  dataUser,
  cars,
  maCarUser,
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const { data: session } = useSession();
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnRecord, setReturnRecord] = useState<any>(null);

  const filteredData = data.filter(
    (item) => item.createdById === session?.user?.userId,
  );

  const handleShowDetail = (record: any, dataUser: any) => {
    setSelectedRecord({ ...record, dataUser });
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

  const handleShowReturn = (record: any) => {
    setReturnRecord(record);
    setReturnModalOpen(true);
  };

  const columns: ColumnsType<MaCarType> = [
    {
      title: "ผู้ขอใช้รถ",
      dataIndex: "createdName",
      key: "createdName",
      align: "center",
      width: 150,
    },
    {
      title: "วัตถุประสงค์",
      dataIndex: "purpose",
      key: "purpose",
      align: "center",
      width: 150,
      responsive: ["md"],
      render: (text: string) => {
        const maxLength = 25;
        if (!text) return "-";
        return text.length > maxLength ? (
          <Tooltip placement="topLeft" title={text}>
            <span className="font-normal cursor-pointer text-gray-700">
              {text.slice(0, maxLength) + "..."}
            </span>
          </Tooltip>
        ) : (
          <span className="font-normal text-gray-700">{text}</span>
        );
      },
    },
    {
      title: "ปลายทาง",
      dataIndex: "destination",
      key: "destination",
      align: "center",
      width: 150,
      responsive: ["lg"],
      render: (text: string) => {
        const maxLength = 20;
        if (!text) return "-";
        return text.length > maxLength ? (
          <Tooltip placement="topLeft" title={text}>
            <span className="font-normal cursor-pointer text-gray-700">
              {text.slice(0, maxLength) + "..."}
            </span>
          </Tooltip>
        ) : (
          <span className="font-normal text-gray-700">{text}</span>
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
            {/* แสดงบนมือถือ: D MMM BB */}
            <span className="md:hidden font-normal">
              {dateObj.format("D MMM BB")}
            </span>
            {/* แสดงบนจอใหญ่: D MMMM BBBB */}
            <span className="hidden md:block font-normal">
              {dateObj.format("D MMMM BBBB")}
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
              {dateObj.format("D MMMM BBBB")}
            </span>
          </>
        );
      },
    },
    {
      title: "รถที่ใช้",
      dataIndex: "masterCar",
      key: "masterCar",
      align: "center",
      width: 150,
      responsive: ["lg"], // ซ่อนบนมือถือ
      render: (masterCar) =>
        masterCar ? `${masterCar.carName} (${masterCar.licensePlate})` : "-",
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
          case "approve":
            color = "green";
            text = "อนุมัติ";
            break;
          case "edit":
            color = "orange";
            text = "รอแก้ไข";
            break;
          case "cancel":
            color = "red";
            text = "ยกเลิก";
            break;
          case "return":
            color = "purple";
            text = "คืนรถแล้ว";
            break;
          case "success":
            color = "default";
            text = "เสร็จสิ้น";
            break;
          default:
            text = status;
            color = "default";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "หมายเหตุ", // แก้คำผิดจาก "หมมายเหตุ"
      dataIndex: "note",
      key: "note",
      align: "center",
      width: 150,
      ellipsis: true,
      responsive: ["xl"], // ซ่อนบนมือถือและจอเล็ก
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
      // เอา fixed ออกตามข้อ 5
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="คืนรถ">
            <CarOutlined
              style={{
                fontSize: 18, // ขนาด 18px
                color: record.status === "approve" ? "#722ed1" : "#d9d9d9",
                cursor: record.status === "approve" ? "pointer" : "not-allowed",
                opacity: record.status === "approve" ? 1 : 0.6,
              }}
              onClick={() => {
                if (record.status === "approve") handleShowReturn(record);
              }}
            />
          </Tooltip>

          <Tooltip title="รายละเอียด">
            <FileSearchOutlined
              style={{ fontSize: 18, color: "#1677ff", cursor: "pointer" }}
              onClick={() => handleShowDetail(record, dataUser)}
            />
          </Tooltip>
          <MaCarExportWord record={record} />
          <Tooltip title="แก้ไข">
            <EditOutlined
              style={{
                fontSize: 18,
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
                  handleEdit(record);
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
          ตารางการการจองรถ
        </h2>
        <hr className="border-slate-100/20 -mx-6 md:-mx-6" />
      </div>
      <CustomTable
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        bordered
        // Responsive config
        scroll={{ x: "max-content" }}
        size="small"
        pagination={{ pageSize: 10, size: "small" }}
      />
      <MaCarDetail
        open={detailModalOpen}
        onClose={handleCloseDetail}
        record={selectedRecord}
        dataUser={dataUser}
      />
      <MaCarEditModal
        open={editModalOpen}
        onClose={handleCloseEdit}
        record={editRecord}
        cars={cars}
        dataUser={dataUser}
        fetchData={fetchData}
        data={data}
        maCarUser={maCarUser}
      />
      <MaCarReturn
        open={returnModalOpen}
        onClose={() => {
          setReturnModalOpen(false);
          setReturnRecord(null);
        }}
        record={returnRecord}
        fetchData={fetchData}
      />
    </>
  );
};

export default MaCarTable;
