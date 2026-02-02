"use client";

import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Popconfirm,
  Space,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  Popover,
  Typography,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveService } from "../services/dataLeave.service";
import DataLeaveDetail from "./dataLeaveDetail";
import { useSession } from "next-auth/react";
import DataLeaveEdit from "./dataLeaveEdit";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import CustomTable from "../../common/CustomTable";
import "dayjs/locale/th";

// Set locale globally
dayjs.locale("th");

interface Props {
  dataLeave: DataLeaveType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setDataLeave: React.Dispatch<React.SetStateAction<DataLeaveType[]>>;
  masterLeave: MasterLeaveType[];
  fetchData: () => Promise<void>;
  leaveByUserId: DataLeaveType[];
  user: UserType[];
}

export default function ManagementDataLeaveTable({
  dataLeave,
  loading,
  setLoading,
  setDataLeave,
  masterLeave,
  fetchData,
  leaveByUserId,
  user,
}: Props) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);
  const [currentRecord, setCurrentRecord] = useState<DataLeaveType | null>(
    null,
  );
  const [form] = Form.useForm();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const { data: session } = useSession();
  const [modalCancelOpen, setModalCancelOpen] = useState(false);
  const [selectedCancelRecord, setSelectedCancelRecord] =
    useState<DataLeaveType | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formEdit] = Form.useForm();

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

  const handleDelete = async (record: DataLeaveType) => {
    try {
      await intraAuthService.deleteDataLeave(record.id);
      setDataLeave((prev) => prev.filter((item) => item.id !== record.id));
      message.success("ลบข้อมูลสำเร็จ");
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const returnEdit = async (record: DataLeaveType) => {
    try {
      await intraAuthService.updateDataLeave({
        id: record.id,
        status: "edit",
      });
      message.success("ส่งคืนเพื่อแก้ไขเรียบร้อย");
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการส่งคืนเพื่อแก้ไข");
    }
  };

  const handleApprove = async (record: any) => {
    try {
      await intraAuthService.updateDataLeave({
        id: record.id,
        status: "approve",
        approvedById: session?.user?.userId,
        approvedByName: session?.user?.fullName,
        approvedDate: new Date().toISOString(),
      });
      message.success("อนุมัติรายการนี้แล้ว");
      fetchData();
      setOpenPopoverId(null);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอนุมัติ:", error);
      message.error("ไม่สามารถอนุมัติได้");
    }
  };

  const handleConfirmCancel = async (values: { cancelReason: string }) => {
    if (!selectedCancelRecord) return;
    const reason = values.cancelReason?.trim();
    if (!reason) {
      message.error("กรุณากรอกเหตุผลการยกเลิก");
      return;
    }

    try {
      const updated = await intraAuthService.updateDataLeave({
        id: selectedCancelRecord.id,
        cancelName: session?.user?.fullName,
        cancelAt: new Date().toISOString(),
        status: "cancel",
        cancelReason: values.cancelReason,
      });

      setDataLeave((prev) =>
        prev.map((item) =>
          item.id === selectedCancelRecord.id ? updated : item,
        ),
      );

      message.success("ยกเลิกเรียบร้อย");
      setModalCancelOpen(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาด");
    }
  };

  const handleShowDetail = (record: any) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRecord(null);
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
      title: "เหตุผล",
      dataIndex: "reason",
      key: "reason",
      align: "center",
      width: 150,
      responsive: ["lg"], // ซ่อนบนมือถือ
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
      title: "หมายเหตุ",
      dataIndex: "details",
      key: "details",
      align: "center",
      width: 150,
      responsive: ["xl"],
      ellipsis: true,
      render: (text: string) => {
        const maxLength = 15;
        if (!text) return "-";
        const truncatedText =
          text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
        const content = (
          <span style={{ fontWeight: "normal" }}>{truncatedText}</span>
        );
        return text.length > maxLength ? (
          <Tooltip placement="topLeft" title={text}>
            {content}
          </Tooltip>
        ) : (
          content
        );
      },
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 180,

      render: (_, record) => (
        <Space size="small">
          {/* Approve Popover */}
          <Popover
            content={
              <Space>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleApprove(record)}
                >
                  อนุมัติ
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() => {
                    setSelectedCancelRecord(record);
                    setModalCancelOpen(true);
                    setOpenPopoverId(null);
                  }}
                >
                  ไม่อนุมัติ
                </Button>
              </Space>
            }
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                <Typography.Text strong>จัดการคำขอ</Typography.Text>
              </Space>
            }
            trigger="click"
            open={openPopoverId === record.id}
            onOpenChange={(visible) => {
              if (record.status === "pending") {
                setOpenPopoverId(visible ? record.id : null);
              }
            }}
          >
            <Tooltip title="อนุมัติ / ไม่อนุมัติ">
              <CheckCircleOutlined
                style={{
                  fontSize: 18, // ขนาด 18px
                  color: record.status === "pending" ? "#52c41a" : "#d9d9d9",
                  cursor:
                    record.status === "pending" ? "pointer" : "not-allowed",
                }}
                onClick={(e) => {
                  if (record.status !== "pending") {
                    e.stopPropagation();
                  }
                }}
              />
            </Tooltip>
          </Popover>

          {/* Return Edit */}
          <Popconfirm
            title="ส่งคืนเพื่อแก้ไข?"
            onConfirm={() => returnEdit(record)}
            okText="ใช่"
            cancelText="ไม่"
            disabled={record.status !== "approve"}
          >
            <Tooltip title="ส่งคืนแก้ไข">
              <RollbackOutlined
                style={{
                  fontSize: 18, // ขนาด 18px
                  color: record.status === "approve" ? "#faad14" : "#d9d9d9",
                  cursor:
                    record.status === "approve" ? "pointer" : "not-allowed",
                }}
              />
            </Tooltip>
          </Popconfirm>

          {/* Detail */}
          <Tooltip title="รายละเอียด">
            <FileSearchOutlined
              style={{ fontSize: 18, color: "#1677ff", cursor: "pointer" }}
              onClick={() => handleShowDetail(record)}
            />
          </Tooltip>

          {/* Edit */}

          {/* Delete */}
          {/* <Popconfirm
            title="ยืนยันการลบ?"
            onConfirm={() => handleDelete(record)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="ลบ">
              <DeleteOutlined
                style={{
                  fontSize: 18, // ขนาด 18px
                  color: "#ff4d4f",
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          </Popconfirm> */}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-2 tracking-tight">
          จัดการข้อมูลการลา
        </h2>
        <hr className="border-slate-100/20 -mx-6 md:-mx-6" />
      </div>

      <CustomTable
        rowKey="id"
        columns={columns}
        dataSource={dataLeave}
        loading={loading}
        bordered
        // ใช้ size small บนมือถือ
        size="small"
        pagination={{ pageSize: 10, size: "small" }}
        // Scroll แนวนอนอัตโนมัติ
        scroll={{ x: "max-content" }}
      />

      <DataLeaveDetail
        open={detailModalOpen}
        onClose={handleCloseDetail}
        record={selectedRecord}
        user={user}
      />

      <DataLeaveEdit
        open={isEditOpen}
        record={currentRecord}
        masterLeaves={masterLeave}
        onClose={() => setIsEditOpen(false)}
        onUpdate={handleUpdate}
        fetchData={fetchData}
        leaveByUserId={leaveByUserId}
        user={user}
        formEdit={formEdit}
      />

      <Modal
        title="ยกเลิกรายการ"
        open={modalCancelOpen}
        onOk={() => form.submit()}
        onCancel={() => setModalCancelOpen(false)}
        okText="ยืนยัน"
        cancelText="ปิด"
        centered
        // Responsive Modal
        style={{ maxWidth: "95%" }}
      >
        <Form form={form} layout="vertical" onFinish={handleConfirmCancel}>
          <Form.Item
            name="cancelReason"
            label="เหตุผลการยกเลิก"
            rules={[{ required: true, message: "โปรดระบุเหตุผล" }]}
          >
            <Input.TextArea rows={3} placeholder="ระบุเหตุผล..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
