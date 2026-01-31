"use client";

import { Space, Tag, Tooltip, Card, message } from "antd";
import React, { useState } from "react";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  MaMedicalEquipmentType,
  MedicalEquipmentType,
} from "../../common/index";
import { useSession } from "next-auth/react";
import MedicalEquipmentTableDetails from "./medicalEquipmentTableDetails";
import ExportMedicalEquipmentWord from "./medicalEquipmentWord";
import {
  EditOutlined,
  FileSearchOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import CustomTable from "../../common/CustomTable";
import MaMedicalEquipmentEditModal from "./maMedicalEquipmentEditModal";
// ✅ 1. Import Return Modal
import MaMedicalEquipmentReturnModal from "./maMedicalEquipmentReturnModal";

dayjs.locale("th");

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  data: MaMedicalEquipmentType[];
  dataEQ: MedicalEquipmentType[];
  fetchData: () => Promise<void>;
};

export default function MedicalEquipmentTable({
  setLoading,
  loading,
  data,
  dataEQ,
  fetchData,
}: Props) {
  const { data: session } = useSession();

  // --- States ---
  // Edit Modal
  const [editingItem, setEditingItem] = useState<MaMedicalEquipmentType | null>(
    null,
  );
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Return Modal (เหลือแค่ State เปิดปิดและข้อมูล)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [recordReturn, setRecordReturn] = useState<any>(null);

  // Detail Modal
  const [openDetails, setOpenDetails] = useState(false);
  const [recordDetails, setRecordDetails] = useState<any>(null);

  // --- Handlers ---
  const handleEdit = (item: MaMedicalEquipmentType) => {
    setEditingItem(item);
    setEditModalVisible(true);
  };

  const handleEditSuccess = async () => {
    setLoading(true);
    setEditModalVisible(false);
    setEditingItem(null);
    await fetchData();
  };

  const handleOpenModalReturn = (record: any) => {
    setRecordReturn(record);
    setIsReturnModalOpen(true);
  };

  // ✅ 2. Handle Success ของการคืน (แค่โหลดข้อมูลใหม่)
  const handleReturnSuccess = async () => {
    setIsReturnModalOpen(false);
    setRecordReturn(null);
    setLoading(true);
    await fetchData();
  };

  const handleOpenModalDetails = (record: any) => {
    setRecordDetails(record);
    setOpenDetails(true);
  };

  // --- Columns ---
  const columns: ColumnsType<MaMedicalEquipmentType> = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "รายการ",
      dataIndex: "items",
      key: "items",
      align: "center",
      width: 140,
      render: (items: any[]) => {
        const maxToShow = 2;
        const hasMore = items?.length > maxToShow;
        const displayItems = hasMore ? items.slice(0, maxToShow) : items;

        return (
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {displayItems?.map((item, index) => (
              <li key={index}>{item.medicalEquipment?.equipmentName}</li>
            ))}
            {hasMore && (
              <Tooltip
                title={items
                  .map((item) => item.medicalEquipment?.equipmentName)
                  .join(", ")}
              >
                <li style={{ cursor: "pointer", color: "#1890ff" }}>...</li>
              </Tooltip>
            )}
          </ul>
        );
      },
    },
    {
      title: "จำนวน",
      dataIndex: "items",
      key: "items",
      align: "center",
      width: 160,
      render: (items: any[]) => {
        if (!items || items.length === 0) return null;
        const firstThree = items.slice(0, 2);
        const rest = items.slice(2);
        return (
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {firstThree.map((item, index) => (
              <li key={index}>{item.quantity}</li>
            ))}
            {rest.length > 0 && (
              <Tooltip
                title={items.map((item) => item.quantity).join(", ")}
                placement="top"
              >
                <li style={{ cursor: "pointer", color: "#1890ff" }}>...</li>
              </Tooltip>
            )}
          </ul>
        );
      },
    },
    {
      title: "วันที่ส่ง",
      dataIndex: "sentDate",
      key: "sentDate",
      align: "center",
      render: (date: string) => {
        if (!date) return "-";
        return dayjs(date).format("D MMMM BBBB");
      },
    },
    {
      title: "ชื่อผู้ส่ง",
      dataIndex: "createdBy",
      key: "createdBy",
      align: "center",
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
            color = "gold";
            text = "รออนุมัติ";
            break;
          case "approve":
            color = "green";
            text = "อนุมัติ";
            break;
          case "cancel":
            color = "red";
            text = "ยกเลิก";
            break;
          case "return":
            color = "purple";
            text = "คืนแล้ว";
            break;
          case "verified":
            color = "cyan";
            text = "ตรวจรับคืนแล้ว";
            break;
          default:
            text = status;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "หมายเหตุเพิ่มเติม",
      dataIndex: "note",
      key: "note",
      align: "center",
      render: (text: string) => {
        const shortText =
          text && text.length > 20 ? text.substring(0, 25) + "..." : text;
        return (
          <Tooltip title={text}>
            <span>{shortText || "-"}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          {/* Edit Button */}
          {(session?.user?.role === "admin" ||
            session?.user?.role === "pharmacy") && (
            <Tooltip title="แก้ไข">
              <EditOutlined
                style={{
                  fontSize: 22,
                  color: record.status === "pending" ? "#faad14" : "#d9d9d9",
                  cursor:
                    record.status === "pending" ? "pointer" : "not-allowed",
                  transition: "color 0.2s",
                }}
                onClick={() => {
                  if (record.status === "pending") {
                    handleEdit(record);
                  }
                }}
              />
            </Tooltip>
          )}

          <Tooltip title="รับคืน">
            <RollbackOutlined
              style={{
                fontSize: 22,
                color: record.status === "approve" ? "#722ed1" : "#d9d9d9",
                cursor: record.status === "approve" ? "pointer" : "not-allowed",
                transition: "color 0.2s",
              }}
              onClick={() => {
                if (record.status === "approve") {
                  handleOpenModalReturn(record);
                }
              }}
            />
          </Tooltip>

          {/* Detail Button */}
          <Tooltip title="รายละเอียด">
            <FileSearchOutlined
              style={{
                fontSize: 22,
                color: "#1677ff",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onClick={() => handleOpenModalDetails(record)}
            />
          </Tooltip>

          {/* Export Button */}
          <ExportMedicalEquipmentWord record={record} />
        </Space>
      ),
    },
  ];

  return (
    <Card
      bordered
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
      title={
        <div
          style={{
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#0683e9ff",
          }}
        >
          รายการส่งเครื่องมือแพทย์
        </div>
      }
    >
      <CustomTable
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      {/* ✅ 3. เรียกใช้ Modal แยกที่สร้างขึ้นมา */}
      <MaMedicalEquipmentEditModal
        open={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
        record={editingItem}
        dataEQ={dataEQ}
      />

      <MaMedicalEquipmentReturnModal
        open={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSuccess={handleReturnSuccess}
        record={recordReturn}
      />

      <MedicalEquipmentTableDetails
        record={recordDetails}
        open={openDetails}
        onClose={() => setOpenDetails(false)}
      />
    </Card>
  );
}
