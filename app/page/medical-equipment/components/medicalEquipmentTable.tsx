"use client";

import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Popconfirm,
  Select,
  Tooltip,
  Card,
  Col,
  Row,
} from "antd";
import React, { useState } from "react";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
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
import MaMedicalEquipmentEditModal from "./maMedicalEquipmentEditModal"; // ✅ 1. Import Component ใหม่

const { Option } = Select;
const { TextArea } = Input;
dayjs.locale("th");

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  data: MaMedicalEquipmentType[];
  dataEQ: MedicalEquipmentType[];
};

export default function MedicalEquipmentTable({
  setLoading,
  loading,
  data,
  dataEQ,
}: Props) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maMedicalEquipmentServices(intraAuth);
  const { data: session } = useSession();

  // --- States ---
  const [editingItem, setEditingItem] = useState<MaMedicalEquipmentType | null>(
    null,
  );
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Return Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formReturn] = Form.useForm();
  const [recordReturn, setRecordReturn] = useState<any>(null);

  // Detail Modal States
  const [openDetails, setOpenDetails] = useState(false);
  const [recordDetails, setRecordDetails] = useState<any>(null);

  // --- Handlers ---

  const handleEdit = (item: MaMedicalEquipmentType) => {
    setEditingItem(item);
    setEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setLoading(true); // Refresh Data
    setEditModalVisible(false);
    setEditingItem(null);
  };

  const handleOpenModalReturn = (record: any) => {
    setRecordReturn(record);
    formReturn.setFieldsValue({
      id: record.id,
      sentDate: record.sentDate ? dayjs(record.sentDate) : null,
      status:
        record.status === "pending"
          ? "รออนุมัติ"
          : record.status === "approve"
            ? "อนุมัติ"
            : record.status === "cancel"
              ? "ยกเลิก"
              : record.status === "return"
                ? "รับคืนแล้ว"
                : "",
      note: record.note,
    });
    setIsModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!recordReturn) return;
    try {
      await intraAuthService.updateMaMedicalEquipment({
        id: recordReturn.id,
        status: "return",
        returnName: session?.user?.fullName,
        returndAt: new Date().toISOString(),
        note: formReturn.getFieldValue("note"),
      });

      message.success("รับคืนอุปกรณ์เรียบร้อยแล้ว");
      setIsModalOpen(false);
      setRecordReturn(null);
      setLoading(true);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการรับคืนอุปกรณ์:", error);
      message.error("ไม่สามารถรับคืนอุปกรณ์ได้");
    }
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
      title: "รายการ/ชื่อเครื่องมือ",
      dataIndex: "items",
      key: "items",
      align: "center",
      width: 160,
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
            <span>{shortText}</span>
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

          {/* Return Button */}
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

  const columnsReturn = [
    {
      title: "ชื่ออุปกรณ์",
      dataIndex: ["medicalEquipment", "equipmentName"],
      key: "equipmentName",
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
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
            fontSize: "20px",
            fontWeight: "bold",
            color: "#0683e9ff",
          }}
        >
          ข้อมูลเครื่องมือแพทย์
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

      {/* ✅ 2. เรียกใช้ MaMedicalEquipmentEditModal แทน Modal เดิม */}
      <MaMedicalEquipmentEditModal
        open={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
        record={editingItem}
        dataEQ={dataEQ}
      />

      {/* Modal รายละเอียดการรับคืน (ยังคงไว้เหมือนเดิม หรือจะแยกไฟล์ก็ได้ถ้าต้องการ) */}
      <Modal
        title="รายละเอียดการรับคืนอุปกรณ์"
        open={isModalOpen}
        onOk={handleConfirmReturn}
        onCancel={() => setIsModalOpen(false)}
        okText="รับคืน"
        cancelText="ยกเลิก"
        width={700}
      >
        <Form form={formReturn} layout="vertical">
          <Form.Item label="รายการอุปกรณ์ที่ส่ง">
            <CustomTable
              dataSource={recordReturn?.items || []}
              columns={columnsReturn}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="วันที่ส่ง"
                name="sentDate"
                rules={[{ required: true, message: "กรุณาเลือกวันที่ส่ง" }]}
              >
                <DatePicker
                  disabled
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="สถานะ" name="status">
                <div>
                  {recordReturn?.status === "pending" && (
                    <Tag color="gold">รออนุมัติ</Tag>
                  )}
                  {recordReturn?.status === "approve" && (
                    <Tag color="green">อนุมัติ</Tag>
                  )}
                  {recordReturn?.status === "cancel" && (
                    <Tag color="red">ยกเลิก</Tag>
                  )}
                  {recordReturn?.status === "return" && (
                    <Tag color="blue">รับคืนแล้ว</Tag>
                  )}
                  {recordReturn?.status === "verified" && (
                    <Tag color="purple">ตรวจรับคืนแล้ว</Tag>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="หมายเหตุ" name="note">
                <Input.TextArea
                  disabled
                  rows={3}
                  placeholder="หมายเหตุเพิ่มเติม"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <MedicalEquipmentTableDetails
        record={recordDetails}
        open={openDetails}
        onClose={() => setOpenDetails(false)}
      />
    </Card>
  );
}
