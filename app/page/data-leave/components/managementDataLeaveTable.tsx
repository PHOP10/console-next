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
  Select,
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
import isBetween from "dayjs/plugin/isBetween";
import DataLeaveEdit from "./dataLeaveEdit";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  RollbackOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import CustomTable from "../../common/CustomTable";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const { data: session } = useSession();
  const { RangePicker } = DatePicker;
  const { TextArea } = Input;
  const [open, setOpen] = useState(false);
  const [modalCancelOpen, setModalCancelOpen] = useState(false);
  const [selectedCancelRecord, setSelectedCancelRecord] =
    useState<DataLeaveType | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [formEdit] = Form.useForm();
  const [isEditOpen, setIsEditOpen] = useState(false);

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
      setLoading(true);
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
      form.resetFields(); // รีเซ็ต Form
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
    { title: "ชื่อผู้ลา", dataIndex: "createdName", key: "createdName" },
    {
      title: "เหตุผลการลา",
      dataIndex: "reason",
      key: "reason",
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
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
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
      render: (_, record) => (
        <Space>
          <Tooltip title="แก้ไข">
            <EditOutlined
              style={{
                fontSize: 22,
                // ใช้สีส้ม (#faad14) เมื่อสถานะเป็น pending, นอกนั้นสีเทา
                color: record.status === "pending" ? "#faad14" : "#d9d9d9",
                cursor: record.status === "pending" ? "pointer" : "not-allowed",
                transition: "color 0.2s",
              }}
              onClick={() => {
                // ต้องเช็คสถานะก่อนเปิด Modal เพราะ Icon ไม่มี prop disabled เหมือน Button
                if (record.status === "pending") {
                  openEditModal(record);
                }
              }}
            />
          </Tooltip>

          <Popconfirm
            title="ยืนยันการลบ"
            // description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?" // ควรใส่ description เพิ่มเพื่อความชัดเจน (ถ้าต้องการ)
            okText="ใช่"
            cancelText="ยกเลิก"
            onConfirm={() => handleDelete(record)}
          >
            <Tooltip title="ลบ">
              <DeleteOutlined
                style={{
                  fontSize: 22,
                  color: "#ff4d4f", // สีแดง Danger
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
                // (Optional) เพิ่มลูกเล่นให้สีเข้มขึ้นตอนเอาเมาส์ชี้
                onMouseEnter={(e) => (e.currentTarget.style.color = "#cf1322")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#ff4d4f")}
              />
            </Tooltip>
          </Popconfirm>

          <Popconfirm
            title="ยืนยันการส่งคืนเพื่อแก้ไข"
            okText="ยืนยัน"
            cancelText="ยกเลิก"
            onConfirm={() => returnEdit(record)}
            disabled={record.status !== "approve"}
          >
            <Tooltip title="ส่งคืนเพื่อแก้ไข">
              <RollbackOutlined
                style={{
                  fontSize: 22,
                  color: record.status === "approve" ? "orange" : "#d9d9d9",
                  cursor:
                    record.status === "approve" ? "pointer" : "not-allowed",
                  transition: "color 0.2s",
                }}
              />
            </Tooltip>
          </Popconfirm>

          <Popover
            trigger="click"
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
                >
                  อนุมัติ
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() => {
                    setSelectedCancelRecord(record);
                    setModalCancelOpen(true);
                    // setPopoverOpen(false);
                    setOpenPopoverId(null);
                  }}
                >
                  ยกเลิก
                </Button>
              </Space>
            }
            open={openPopoverId === record.id}
            onOpenChange={(open) => setOpenPopoverId(open ? record.id : null)}
          >
            <Tooltip title="อนุมัติ">
              <CheckCircleOutlined
                style={{
                  fontSize: 22,
                  color: record.status !== "pending" ? "#ccc" : "#52c41a", // เทาเมื่อ disable, เขียวเมื่อ active
                  cursor:
                    record.status !== "pending" ? "not-allowed" : "pointer",
                  opacity: record.status !== "pending" ? 0.5 : 1,
                }}
                onClick={() => {
                  if (record.status === "pending") {
                    setOpenPopoverId(record.id);
                  }
                }}
              />
            </Tooltip>
          </Popover>

          <Tooltip title="รายละเอียด">
            <FileSearchOutlined
              style={{ fontSize: 22, color: "#1677ff", cursor: "pointer" }}
              onClick={() => handleShowDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <DataLeaveDetail
        open={detailModalOpen}
        onClose={handleCloseDetail}
        record={selectedRecord}
        user={user}
      />
      <CustomTable
        rowKey="id"
        columns={columns}
        dataSource={dataLeave}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      <DataLeaveEdit
        open={isEditOpen}
        record={currentRecord}
        masterLeaves={masterLeave}
        onClose={() => {
          setIsEditOpen(false);
        }}
        onUpdate={handleUpdate}
        fetchData={fetchData}
        leaveByUserId={leaveByUserId}
        user={user}
        formEdit={formEdit}
      />

      <Modal
        title="ยกเลิกการลา"
        open={modalCancelOpen}
        onOk={() => form.submit()}
        onCancel={() => setModalCancelOpen(false)}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => handleConfirmCancel(values)}
        >
          <Form.Item
            label="เหตุผลการยกเลิก"
            name="cancelReason"
            rules={[{ required: true, message: "กรุณากรอกเหตุผลการยกเลิก" }]}
          >
            <Input.TextArea placeholder="กรุณากรอกเหตุผลการยกเลิก" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
