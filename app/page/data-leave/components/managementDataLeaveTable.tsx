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
  const [modalReturnOpen, setModalReturnOpen] = useState(false);
  const [selectedReturnRecord, setSelectedReturnRecord] =
    useState<DataLeaveType | null>(null);
  const [formReturn] = Form.useForm();

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

  const handleConfirmReturn = async (values: { reasonReturn: string }) => {
    if (!selectedReturnRecord) return;

    const reason = values.reasonReturn?.trim();
    if (!reason) {
      message.error("กรุณากรอกเหตุผลการส่งคืนเพื่อแก้ไข");
      return;
    }

    try {
      await intraAuthService.updateDataLeave({
        id: selectedReturnRecord.id,
        status: "edit",
        reasonReturn: reason,
      });

      message.success("ส่งคืนเพื่อแก้ไขเรียบร้อย");
      fetchData();
      setModalReturnOpen(false);
      formReturn.resetFields();
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
      message.error("กรุณากรอกเหตุผลการไม่อนุมัติ");
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

      message.success("ไม่อนุมัติเรียบร้อยแล้ว");
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
      dataIndex: "createdById",
      key: "createdById",
      align: "center",
      width: 150,
      render: (createdById: string) => {
        const foundUser = user.find((u) => u.userId === createdById);

        return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : "-";
      },
    },
    {
      title: "เหตุผลการลา",
      dataIndex: "reason",
      key: "reason",
      align: "center",
      width: 150,
      responsive: ["lg"],
      render: (text: string) => {
        const maxLength = 25;
        if (!text) return "-";

        return text.length > maxLength ? (
          <Tooltip placement="topLeft" title={text}>
            <span style={{ fontWeight: "normal" }}>
              {text.slice(0, maxLength) + "..."}
            </span>
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
            text = "ไม่อนุมัติ";
            break;
          case "resubmitted":
            color = "geekblue";
            text = "รออนุมัติ (แก้ไขแล้ว)";
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
              <Space
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  width: "100%",
                  marginTop: 13,
                }}
              >
                <Button
                  danger
                  size="small"
                  onClick={() => {
                    setSelectedCancelRecord(record);
                    setModalCancelOpen(true);
                    setOpenPopoverId(null);
                    form.resetFields();
                  }}
                >
                  ไม่อนุมัติ {/* ✅ เปลี่ยนจาก ยกเลิก เป็น ไม่อนุมัติ */}
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleApprove(record)}
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                  }}
                >
                  อนุมัติ
                </Button>
              </Space>
            }
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                <Typography.Text strong>ยืนยันการอนุมัติ ?</Typography.Text>
              </Space>
            }
            trigger="click"
            open={openPopoverId === record.id}
            onOpenChange={(visible) => {
              // ✅ เพิ่มการรองรับสถานะ resubmitted ให้สามารถเปิด Popover ได้
              if (
                record.status === "pending" ||
                record.status === "resubmitted"
              ) {
                setOpenPopoverId(visible ? record.id : null);
              }
            }}
          >
            <Tooltip title={"อนุมัติ"}>
              <CheckCircleOutlined
                style={{
                  fontSize: 18,
                  // ✅ เปลี่ยนสีไอคอนให้เป็นสีเขียวถ้าเป็น pending หรือ resubmitted
                  color:
                    record.status === "pending" ||
                    record.status === "resubmitted"
                      ? "#52c41a"
                      : "#d9d9d9",
                  // ✅ เปลี่ยน cursor ให้กดได้ถ้าเป็น pending หรือ resubmitted
                  cursor:
                    record.status === "pending" ||
                    record.status === "resubmitted"
                      ? "pointer"
                      : "not-allowed",
                }}
                onClick={(e) => {
                  // ✅ ป้องกันการคลิกถ้าไม่ใช่ pending หรือ resubmitted
                  if (
                    record.status !== "pending" &&
                    record.status !== "resubmitted"
                  ) {
                    e.stopPropagation();
                  }
                }}
              />
            </Tooltip>
          </Popover>

          <Tooltip
            title={record.status === "approve" ? "ส่งคืนเพื่อแก้ไข" : ""}
          >
            <RollbackOutlined
              style={{
                fontSize: 18,
                color: record.status === "approve" ? "#faad14" : "#d9d9d9",
                cursor: record.status === "approve" ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (record.status === "approve") {
                  setSelectedReturnRecord(record);
                  setModalReturnOpen(true);
                  formReturn.setFieldsValue({
                    reasonReturn: record.reasonReturn || "",
                  });
                }
              }}
            />
          </Tooltip>

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
        size="small"
        pagination={{ pageSize: 10, size: "small" }}
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
        title="ยืนยันการไม่อนุมัติรายการ"
        open={modalCancelOpen}
        onOk={() => form.submit()}
        onCancel={() => setModalCancelOpen(false)}
        okText="ยืนยัน"
        cancelButtonProps={{ style: { display: "none" } }}
        centered
        okButtonProps={{ danger: true }}
        style={{ maxWidth: "95%" }}
      >
        <Form form={form} layout="vertical" onFinish={handleConfirmCancel}>
          <Form.Item
            name="cancelReason"
            label="เหตุผลการไม่อนุมัติ"
            rules={[
              { required: true, message: "กรุณากรอกเหตุผลการไม่อนุมัติ" },
            ]}
          >
            <Input.TextArea rows={3} placeholder="กรอกเหตุผลที่ไม่อนุมัติ..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="ส่งคืนเพื่อแก้ไข"
        open={modalReturnOpen}
        onOk={() => formReturn.submit()}
        onCancel={() => setModalReturnOpen(false)}
        okText="ยืนยันการส่งคืน"
        cancelText="ยกเลิก"
        centered
        okButtonProps={{
          type: "primary",
          style: { backgroundColor: "#faad14" },
        }}
        style={{ maxWidth: "95%" }}
      >
        <Form
          form={formReturn}
          layout="vertical"
          onFinish={handleConfirmReturn}
        >
          <Form.Item
            name="reasonReturn"
            label="เหตุผลการส่งคืน"
            rules={[{ required: true, message: "กรุณากรอกเหตุผลที่ต้องแก้ไข" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="กรอกเหตุผลที่ต้องการให้ผู้ใช้แก้ไขข้อมูล..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
