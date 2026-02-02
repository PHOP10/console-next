"use client";

import { Space, Tag, Tooltip, Card, message } from "antd";
import React, { useState } from "react";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  MaMedicalEquipmentType,
  MedicalEquipmentType,
  UserType,
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
import MaMedicalEquipmentReturnModal from "./maMedicalEquipmentReturnModal";

dayjs.locale("th");

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  data: MaMedicalEquipmentType[];
  dataEQ: MedicalEquipmentType[];
  fetchData: () => Promise<void>;
  allUsers: UserType[];
};

export default function MedicalEquipmentTable({
  setLoading,
  loading,
  data,
  dataEQ,
  allUsers,
  fetchData,
}: Props) {
  const { data: session } = useSession();

  // --- States ---
  const [editingItem, setEditingItem] = useState<MaMedicalEquipmentType | null>(
    null,
  );
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [recordReturn, setRecordReturn] = useState<any>(null);

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
      width: 60,
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
          <ul style={{ paddingLeft: 20, margin: 0, textAlign: "left" }}>
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
      key: "items_qty",
      align: "center",
      width: 90,
      render: (items: any[]) => {
        if (!items || items.length === 0) return null;
        const firstThree = items.slice(0, 2);
        const rest = items.slice(2);
        return (
          <ul style={{ paddingLeft: 20, margin: 0, textAlign: "left" }}>
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
      width: 120,
      render: (date: string) => {
        if (!date) return "-";
        const dateObj = dayjs(date);
        return (
          <>
            {/* แสดงบนมือถือ: D MMM BB (2 ม.ค. 69) */}
            <span className="md:hidden font-normal">
              {dateObj.format("D MMM BB")}
            </span>
            {/* แสดงบนจอใหญ่: D MMMM BBBB (2 มกราคม 2569) */}
            <span className="hidden md:block font-normal">
              {dateObj.format("D MMMM BBBB")}
            </span>
          </>
        );
      },
    },
    {
      title: "ชื่อผู้ส่ง",
      dataIndex: "createdBy",
      key: "createdBy",
      align: "center",
      width: 120,
      responsive: ["md"], // ซ่อนบนมือถือ
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
      title: "หมายเหตุ",
      dataIndex: "note",
      key: "note",
      align: "center",
      width: 150,
      responsive: ["md"],
      render: (text: string) => {
        const shortText =
          text && text.length > 20 ? text.substring(0, 25) + "..." : text;
        return (
          <Tooltip title={text}>
            <span style={{ fontWeight: "normal" }}>{shortText || "-"}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 140,
      // เอา fixed ออกตามข้อ 5
      render: (_, record) => (
        <Space size="small">
          {/* Edit Button */}
          <Tooltip title="รับคืน">
            <RollbackOutlined
              style={{
                fontSize: 18, // ขนาด 18 ตามข้อ 3
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
                fontSize: 18,
                color: "#1677ff",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onClick={() => handleOpenModalDetails(record)}
            />
          </Tooltip>

          {/* Export Button */}
          {/* อย่าลืมไปปรับ size icon ใน component ExportMedicalEquipmentWord ด้วยถ้าทำได้ แต่ถ้าเป็น button ปกติให้ปล่อยไว้ */}
          <ExportMedicalEquipmentWord record={record} allUsers={allUsers} />

          {(session?.user?.role === "admin" ||
            session?.user?.role === "pharmacy") && (
            <Tooltip title="แก้ไข">
              <EditOutlined
                style={{
                  fontSize: 18,
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
            // ปรับขนาด Font ให้ Responsive
            fontSize: "clamp(18px, 4vw, 24px)",
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
        // ใช้ size small เพื่อให้ตารางกะทัดรัดขึ้นบนมือถือ
        size="small"
        pagination={{ pageSize: 10, size: "small" }}
        scroll={{ x: "max-content" }}
      />

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
