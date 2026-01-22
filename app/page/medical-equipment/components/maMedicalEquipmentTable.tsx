"use client";

import React, { useState } from "react";
import {
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
  Popover,
  Typography,
  Tooltip,
  Card,
  Row,
  Col,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import {
  MaMedicalEquipmentType,
  MedicalEquipmentType,
} from "../../common/index";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import MedicalEquipmentTableDetails from "./medicalEquipmentTableDetails";
import CustomTable from "../../common/CustomTable";
import MaMedicalEquipmentEditModal from "./maMedicalEquipmentEditModal"; // Import Component ใหม่

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  data: MaMedicalEquipmentType[];
  dataEQ: MedicalEquipmentType[];
};

export default function MaMedicalEquipmentTable({
  setLoading,
  loading,
  data,
  dataEQ,
}: Props) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maMedicalEquipmentServices(intraAuth);
  const { data: session } = useSession();

  // State
  const [editingItem, setEditingItem] = useState<MaMedicalEquipmentType | null>(
    null,
  );
  const [editModalVisible, setEditModalVisible] = useState(false);

  // States อื่นๆ (Cancel, Approve, Return, Detail)
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false); // ใช้ร่วมกัน Cancel/Return (ควรแยกถ้าทำได้ แต่ตามโค้ดเดิมใช้ร่วมกัน)
  const [selectedRecord, setSelectedRecord] =
    useState<MaMedicalEquipmentType | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [recordDetails, setRecordDetails] = useState<any>(null);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [recordReturn, setRecordReturn] = useState<any>(null);
  const [formReturn] = Form.useForm();

  // --- Edit Handler ---
  const handleEdit = (item: MaMedicalEquipmentType) => {
    setEditingItem(item);
    setEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setLoading(true); // Refresh Data
    setEditModalVisible(false);
    setEditingItem(null);
  };

  // --- Other Handlers (Cancel, Approve, Return) ---
  const handleCancel = async (values: any) => {
    if (!selectedRecord) return;
    try {
      await intraAuthService.updateMaMedicalEquipment({
        id: selectedRecord.id,
        status: "cancel",
        cancelReason: values.cancelReason,
        nameReason: session?.user?.fullName,
        createdAt: new Date().toISOString(),
      });

      message.success("ยกเลิกรายการแล้ว");
      setIsModalOpen(false);
      setSelectedRecord(null);
      setLoading(true);
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      message.error("ไม่สามารถยกเลิกรายการได้");
    }
  };

  const handleApprove = async (record: any) => {
    try {
      await intraAuthService.updateMaMedicalEquipment({
        id: record.id,
        status: "approve",
        approveById: session?.user?.userId,
        approveBy: session?.user?.fullName,
        approveAt: new Date().toISOString(),
      });
      message.success("อนุมัติรายการแล้ว");
      setLoading(true);
      setOpenPopoverId(null);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอนุมัติ:", error);
      message.error("ไม่สามารถอนุมัติได้");
    }
  };

  const handleOpenModalDetails = (record: any) => {
    setRecordDetails(record);
    setOpenDetails(true);
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
      returnName: record.returnName,
    });
    setIsModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!recordReturn) return;
    try {
      await intraAuthService.updateMaMedicalEquipment({
        id: recordReturn.id,
        status: "verified",
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

  const columns: ColumnsType<MaMedicalEquipmentType> = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      width: 45,
      align: "center",
    },
    {
      title: "รายการ/ชื่อเครื่องมือ",
      dataIndex: "items",
      key: "items",
      width: 200,
      align: "center",
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
      width: 160,
      align: "center",
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
            break; // ปรับสีให้ชัดขึ้น
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
      title: "การจัดการ",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          {/* Delete */}
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
            onConfirm={async () => {
              try {
                await intraAuthService.deleteMaMedicalEquipment(record.id);
                message.success("ลบข้อมูลสำเร็จ");
                setLoading(true);
              } catch (error) {
                message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
              }
            }}
            okText="ใช่"
            cancelText="ยกเลิก"
          >
            <Tooltip title="ลบ">
              <DeleteOutlined
                style={{ fontSize: 20, color: "#ff4d4f", cursor: "pointer" }}
              />
            </Tooltip>
          </Popconfirm>

          {/* Edit */}
          <Tooltip title="แก้ไข">
            <EditOutlined
              style={{
                fontSize: 20,
                color: record.status === "pending" ? "#faad14" : "#d9d9d9",
                cursor: record.status === "pending" ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (record.status === "pending") handleEdit(record);
              }}
            />
          </Tooltip>

          {/* Verify Return */}
          <Tooltip title="ยืนยันรับคืน">
            <RollbackOutlined
              style={{
                fontSize: 20,
                color: record.status === "return" ? "#722ed1" : "#d9d9d9",
                cursor: record.status === "return" ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (record.status === "return") handleOpenModalReturn(record);
              }}
            />
          </Tooltip>

          {/* Approve Popover */}
          <Popover
            trigger="click"
            open={openPopoverId === record.id}
            onOpenChange={(open) => {
              if (open && record.status === "pending")
                setOpenPopoverId(record.id);
              else if (!open) setOpenPopoverId(null);
            }}
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                <Typography.Text strong>ยืนยันการอนุมัติ ?</Typography.Text>
              </Space>
            }
            content={
              <Space style={{ display: "flex", marginTop: 13 }}>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleApprove(record)}
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                >
                  อนุมัติ
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() => {
                    setSelectedRecord(record);
                    setIsModalOpen(true);
                    setOpenPopoverId(null);
                  }}
                >
                  ยกเลิก
                </Button>
              </Space>
            }
          >
            <Tooltip
              title={record.status === "pending" ? "อนุมัติ" : "ดำเนินการแล้ว"}
            >
              <CheckCircleOutlined
                style={{
                  fontSize: 20,
                  color: record.status === "pending" ? "#52c41a" : "#d9d9d9",
                  cursor:
                    record.status === "pending" ? "pointer" : "not-allowed",
                  opacity: record.status === "pending" ? 1 : 0.5,
                }}
                onClick={(e) => {
                  if (record.status !== "pending") e.stopPropagation();
                }}
              />
            </Tooltip>
          </Popover>

          {/* Details */}
          <Tooltip title="รายละเอียด">
            <FileSearchOutlined
              onClick={() => handleOpenModalDetails(record)}
              style={{ fontSize: 20, color: "#1677ff", cursor: "pointer" }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <div
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#0683e9",
          }}
        >
          ข้อมูลเครื่องมือแพทย์
        </div>
      }
      bordered
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
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

      {/* เรียกใช้ Edit Modal ตัวใหม่ */}
      <MaMedicalEquipmentEditModal
        open={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
        record={editingItem}
        dataEQ={dataEQ}
      />

      {/* Modal ยกเลิก (ถ้าจะแยกอีกก็ทำได้ในอนาคต) */}
      <Modal
        title="กรอกเหตุผลการยกเลิกรายการนี้"
        open={isModalOpen && !recordReturn} // เช็คว่าไม่ใช่ Modal Return
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
        }}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical" onFinish={handleCancel}>
          <Form.Item
            name="cancelReason"
            rules={[{ required: true, message: "กรุณาระบุเหตุผลการยกเลิก" }]}
          >
            <Input.TextArea rows={3} placeholder="ระบุเหตุผลการยกเลิก" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Return Confirmation */}
      <Modal
        title="รายละเอียดการรับคืนอุปกรณ์"
        open={isModalOpen && !!recordReturn}
        onOk={handleConfirmReturn}
        onCancel={() => {
          setIsModalOpen(false);
          setRecordReturn(null);
        }}
        okText="ยืนยันรับคืน"
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
              <Form.Item label="วันที่ส่ง" name="sentDate">
                <DatePicker
                  disabled
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="สถานะ" name="status">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="หมายเหตุ" name="note">
                <Input.TextArea disabled rows={3} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="ผู้รับคืน" name="returnName">
                <Input disabled />
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
