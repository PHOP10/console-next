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
import { FileSearchOutlined, FormOutlined } from "@ant-design/icons";

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

  // const handleUpdate = async (values: any) => {
  //   await intraAuthService.updateMaCar(values);
  //   fetchData();
  // };

  const columns: ColumnsType<MaCarType> = [
    // { title: "ผู้ขอใช้รถ", dataIndex: "requesterName", key: "requesterName" },
    {
      title: "วัตถุประสงค์",
      dataIndex: "purpose",
      key: "purpose",
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
      title: "ปลายทาง",
      dataIndex: "destination",
      key: "destination",
      align: "center",
      render: (text: string) => {
        const maxLength = 20;
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
      title: "รถที่ใช้",
      dataIndex: "masterCar",
      key: "masterCar",
      align: "center",
      render: (masterCar) =>
        masterCar ? `${masterCar.carName} (${masterCar.licensePlate})` : "-",
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
            text = "รอดำเนินการ";
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
          default:
            text = status;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "หมมายเหตุ",
      dataIndex: "note",
      key: "note",
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
      render: (_, record) => (
        <Space>
          {/* <Button
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
          </Button> */}

          <Tooltip title="แก้ไข">
            <FormOutlined
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
                  handleEdit(record);
                }
              }}
            />
          </Tooltip>

          {/* <Button
            size="small"
            type="primary"
            onClick={() => handleShowDetail(record, dataUser)}
          >
            รายละเอียด
          </Button> */}

          <Tooltip title="รายละเอียด">
            <FileSearchOutlined
              style={{ fontSize: 22, color: "#1677ff", cursor: "pointer" }}
              onClick={() => handleShowDetail(record, dataUser)}
            />
          </Tooltip>
          <MaCarExportWord record={record} />
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
        ข้อมูลการจองรถ
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        scroll={{ x: "max-content" }}
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
        // onUpdate={handleUpdate}
        fetchData={fetchData}
        data={data}
        maCarUser={maCarUser}
      />
    </>
  );
};

export default MaCarTable;
