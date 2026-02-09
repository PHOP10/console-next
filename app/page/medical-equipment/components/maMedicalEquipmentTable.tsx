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
import MaMedicalEquipmentEditModal from "./maMedicalEquipmentEditModal";

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  data: MaMedicalEquipmentType[];
  dataEQ: MedicalEquipmentType[];
  fetchData?: () => Promise<void>;
};

export default function MaMedicalEquipmentTable({
  setLoading,
  loading,
  data,
  dataEQ,
  fetchData,
}: Props) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maMedicalEquipmentServices(intraAuth);
  const { data: session } = useSession();
  const [editingItem, setEditingItem] = useState<MaMedicalEquipmentType | null>(
    null,
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    setLoading(true);
    setEditModalVisible(false);
    setEditingItem(null);
  };

  // --- Other Handlers ---
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
      fetchData;
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
      fetchData;
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
      fetchData;
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
            {/* แสดงบนมือถือ */}
            <span className="md:hidden font-normal">
              {dateObj.format("D MMM BB")}
            </span>
            {/* แสดงบนจอใหญ่ */}
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
      responsive: ["lg"],
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
      width: 160,
      // ไม่ใช้ fixed ตามข้อ 5
      render: (_, record) => (
        <Space size="small">
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
              <Space
                style={{
                  display: "flex",
                  marginTop: 13,
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                <Button
                  danger
                  size="small"
                  onClick={() => {
                    setSelectedRecord(record);
                    setIsModalOpen(true);
                    setOpenPopoverId(null);
                    form.resetFields();
                  }}
                >
                  ยกเลิก
                </Button>{" "}
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleApprove(record)}
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                >
                  อนุมัติ
                </Button>
              </Space>
            }
          >
            <Tooltip
              title={record.status === "pending" ? "อนุมัติ" : "อนุมัติแล้ว"}
            >
              <CheckCircleOutlined
                style={{
                  fontSize: 18, // ขนาด 18 ตามข้อ 3
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

          {/* Verify Return */}
          {/* <Tooltip title="ยืนยันรับคืน">
            <RollbackOutlined
              style={{
                fontSize: 18,
                color: record.status === "return" ? "#722ed1" : "#d9d9d9",
                cursor: record.status === "return" ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (record.status === "return") handleOpenModalReturn(record);
              }}
            />
          </Tooltip> */}

          {/* Details */}
          <Tooltip title="รายละเอียด">
            <FileSearchOutlined
              onClick={() => handleOpenModalDetails(record)}
              style={{ fontSize: 18, color: "#1677ff", cursor: "pointer" }}
            />
          </Tooltip>

          {/* Edit */}
          <Tooltip title="แก้ไข">
            <EditOutlined
              style={{
                fontSize: 18,
                color: record.status === "pending" ? "#faad14" : "#d9d9d9",
                cursor: record.status === "pending" ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (record.status === "pending") handleEdit(record);
              }}
            />
          </Tooltip>

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
                style={{ fontSize: 18, color: "#ff4d4f", cursor: "pointer" }}
              />
            </Tooltip>
          </Popconfirm>
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
            // Responsive font size
            fontSize: "clamp(18px, 4vw, 24px)",
            fontWeight: "bold",
            color: "#0683e9",
          }}
        >
          จัดการรายการส่งเครื่องมือแพทย์
        </div>
      }
      bordered
      style={{ width: "100%" }}
    >
      <CustomTable
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        // ใช้ size small บนมือถือ
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

      {/* Modal ยกเลิก */}
      <Modal
        title="ยืนยันการยกเลิกรายการ"
        open={isModalOpen && !recordReturn}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
        }}
        okText="ยืนยันการยกเลิก"
        cancelButtonProps={{ style: { display: "none" } }}
        centered
        okButtonProps={{ danger: true }}
        style={{ maxWidth: "95%" }}
      >
        <Form form={form} layout="vertical" onFinish={handleCancel}>
          <Form.Item
            name="cancelReason"
            label="เหตุผลการยกเลิก"
            rules={[{ required: true, message: "กรุณากรอกเหตุผลการยกเลิก" }]}
          >
            <Input.TextArea rows={3} placeholder="กรอกเหตุผลการยกเลิก" />
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
        centered
        style={{ maxWidth: "95%" }}
      >
        <Form form={formReturn} layout="vertical">
          <Form.Item label="รายการอุปกรณ์ที่ส่ง">
            <CustomTable
              dataSource={recordReturn?.items || []}
              columns={columnsReturn}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: "max-content" }}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="วันที่ส่ง" name="sentDate">
                <DatePicker
                  disabled
                  format="DD MMM YYYY"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="สถานะ" name="status">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="หมายเหตุ" name="note">
                <Input.TextArea disabled rows={3} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
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
