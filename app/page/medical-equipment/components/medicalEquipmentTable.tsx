"use client";

import { Space, Tag, Tooltip, Card, message, Popover } from "antd";
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
      title: "รายการเครื่องมือแพทย์",
      dataIndex: "items",
      key: "items",
      align: "center",
      width: 150,
      render: (items: any[]) => {
        if (!items?.length) return "-";
        const content = (
          <div
            style={{ maxHeight: "300px", overflowY: "auto", minWidth: "200px" }}
          >
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <span>{item.medicalEquipment?.equipmentName}</span>
                <b style={{ marginLeft: 16 }}>x {item.quantity}</b>
              </div>
            ))}
          </div>
        );

        return (
          <Popover content={content} title="รายละเอียดรายการ" placement="right">
            {/* แสดงแค่สรุปจำนวน */}
            <span
              style={{
                color: "#1890ff",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              รวม {items.length} รายการ
            </span>
          </Popover>
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
            color = "blue";
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
            color = "default";
            text = "รับคืนแล้ว";
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
      style={{ width: "100%" }}
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
