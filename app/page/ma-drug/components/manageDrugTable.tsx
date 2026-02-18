"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  message,
  Space,
  Tag,
  Card,
  Tooltip,
  Modal,
  Input,
  Popover,
  Typography,
  Form,
} from "antd";
import {
  DeleteOutlined,
  CheckCircleOutlined,
  FileExcelOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { MaDrugType } from "../../common";
import { exportMaDrugToExcel } from "./maDrugExport";
import { useSession } from "next-auth/react";
import MaDrugTableDetail from "./maDrugDetail";
import MaDrugEdit from "./maDrugEdit";
import CustomTable from "../../common/CustomTable";
import dayjs from "dayjs";
import "dayjs/locale/th";

// Set locale globally
dayjs.locale("th");

interface ManageDrugTableProps {
  data: MaDrugType[];
  fetchData: () => void;
  setData: React.Dispatch<React.SetStateAction<MaDrugType[]>>;
}

export default function ManageDrugTable({
  data,
  fetchData,
  setData,
}: ManageDrugTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaDrugType | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [formCancel] = Form.useForm();

  const openCancelModal = (id: number) => {
    setCancelingId(id);
    setCancelReason("");
    setIsCancelModalOpen(true);
    setOpenPopoverId(null);
    formCancel.resetFields();
  };

  const handleViewDetail = (record: MaDrugType) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const handleEdit = (record: MaDrugType) => {
    setSelectedRecord(record);
    setEditVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await intraAuthService.deleteMaDrug(id);
      message.success("ลบข้อมูลสำเร็จ");
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      message.error("ลบข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setLoading(true);
      await intraAuthService.updateMaDrug({ id, status: "approved" });
      message.success("อนุมัติรายการเรียบร้อย");
      setOpenPopoverId(null);
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("อนุมัติไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubmit = async (values: any) => {
    if (!cancelingId) return;

    try {
      setCancelLoading(true);
      const payload = {
        id: cancelingId,
        status: "cancel",
        cancelReason: values.cancelReason,
        cancelName: session?.user?.fullName || "ไม่ระบุตัวตน",
      };

      await intraAuthService.updateMaDrug(payload);
      message.success("ยกเลิกรายการเรียบร้อยแล้ว");
      setIsCancelModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการยกเลิก");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleExport = (record: MaDrugType) => {
    try {
      message.loading("กำลังสร้างไฟล์ Excel...", 1);
      exportMaDrugToExcel(record);
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการสร้างไฟล์");
    }
  };

  const columns: ColumnsType<MaDrugType> = [
    {
      title: "เลขที่เบิก",
      dataIndex: "requestNumber",
      key: "requestNumber",
      align: "center",
      width: 120,
    },
    {
      title: "หน่วยงาน",
      dataIndex: "requestUnit",
      key: "requestUnit",
      align: "center",
      width: 100,
      responsive: ["sm"],
      render: (text) => {
        const shortText =
          text && text.length > 20 ? text.substring(0, 30) + "..." : text;
        return (
          <Tooltip title={text}>
            <span style={{ fontWeight: "normal" }}>{shortText || "-"}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "ผู้ขอเบิก",
      dataIndex: "requesterName",
      key: "requesterName",
      align: "center",
      width: 100,
      responsive: ["md"],
    },
    {
      title: "วันที่ขอเบิก",
      dataIndex: "requestDate",
      key: "requestDate",
      align: "center",
      width: 120,
      render: (text: string) => {
        if (!text) return "-";
        const dateObj = dayjs(text);
        return (
          <>
            {/* แสดงบนมือถือ: D MMM BB */}
            <span className="md:hidden font-normal">
              {dateObj.format("D MMM BB")}
            </span>
            {/* แสดงบนจอใหญ่: D MMMM BBBB */}
            <span className="hidden md:block font-normal">
              {dateObj.format("D MMMM BBBB")}
            </span>
          </>
        );
      },
    },
    {
      title: "รายการ",
      dataIndex: "quantityUsed",
      key: "quantityUsed",
      align: "center",
      width: 90,
      render: (val) => `${val || 0} รายการ`,
    },
    {
      title: "ยอดรวม",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "center",
      width: 100,
      render: (val) => (
        <span className="text-blue-600 font-semibold">
          {val
            ? val.toLocaleString(undefined, { minimumFractionDigits: 2 })
            : "0.00"}
        </span>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 100,
      render: (status) => {
        let color = "default";
        let text = "-";
        switch (status) {
          case "pending":
            color = "blue";
            text = "รออนุมัติ";
            break;
          case "approved":
            color = "green";
            text = "อนุมัติแล้ว";
            break;
          case "completed":
            color = "default";
            text = "รับยาแล้ว";
            break;
          case "canceled":
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
      title: "การจัดการ",
      key: "actions",
      align: "center",
      width: 180,
      render: (_, record) => {
        const isPending = record.status === "pending";
        return (
          <Space size="small">
            {/* 1. ปุ่มอนุมัติ */}
            <Popover
              trigger={isPending ? "click" : []}
              open={isPending && openPopoverId === record.id}
              onOpenChange={(open) => {
                if (isPending) {
                  setOpenPopoverId(open ? record.id : null);
                }
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
                    justifyContent: "flex-end",
                    width: "100%",
                    marginTop: 13,
                  }}
                >
                  <Button
                    danger
                    size="small"
                    onClick={() => openCancelModal(record.id)}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleApprove(record.id)}
                    // เปลี่ยนสีปุ่มเป็นสีเขียว
                    style={{
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                    }}
                  >
                    อนุมัติ
                  </Button>
                </Space>
              }
            >
              <Tooltip title={isPending ? "อนุมัติ" : "อนุมัติแล้ว"}>
                <Button
                  type="text"
                  shape="circle"
                  style={{
                    color: isPending ? "#52c41a" : "#ccc",
                    cursor: isPending ? "pointer" : "not-allowed",
                  }}
                  icon={
                    <CheckCircleOutlined
                      style={{
                        fontSize: 18,
                        opacity: isPending ? 1 : 0.5,
                      }}
                    />
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPending) {
                      setOpenPopoverId(record.id);
                    }
                  }}
                />
              </Tooltip>
            </Popover>

            {/* 2. ดูรายละเอียด */}
            <Tooltip title="ดูรายละเอียด">
              <Button
                type="text"
                shape="circle"
                icon={
                  <FileSearchOutlined
                    style={{ fontSize: 18, color: "#1677ff" }} // ปรับขนาดไอคอนเป็น 18px
                  />
                }
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>

            {/* 3. ปุ่ม Export Excel */}
            {/* <Tooltip title="พิมพ์ใบเบิก (Excel)">
              <Button
                type="text"
                shape="circle"
                icon={
                  <FileExcelOutlined
                    style={{ fontSize: 18, color: "#217346" }} // ปรับขนาดไอคอนเป็น 18px
                  />
                }
                onClick={() => handleExport(record)}
              />
            </Tooltip> */}

            {/* 4. ปุ่มแก้ไข */}
            {/* <Tooltip title="แก้ไขข้อมูล">
              <Button
                type="text"
                shape="circle"
                icon={
                  <EditOutlined
                    style={{
                      fontSize: 18,
                      color: isPending ? "#faad14" : "#d9d9d9",
                    }}
                  />
                }
                disabled={!isPending}
                onClick={() => isPending && handleEdit(record)}
              />
            </Tooltip> */}

            {/* 5. ปุ่มลบ */}
            <Tooltip title="ลบรายการ">
              <Popconfirm
                title="ยืนยันการลบ"
                description="ยืนยันการลบข้อมูลรายการนี้หรือไม่?"
                onConfirm={() => handleDelete(record.id)}
                okText="ลบ"
                cancelText="ยกเลิก"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  shape="circle"
                  icon={
                    <DeleteOutlined
                      style={{ fontSize: 18, color: "#ff4d4f" }}
                    />
                  }
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-[#0683e9] text-center mb-2 tracking-tight">
          จัดการรายการเบิกยา
        </h2>
        <hr className="border-slate-100/30 -mx-6 md:-mx-6" />
      </div>

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

      <MaDrugTableDetail
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        data={selectedRecord}
      />

      <Modal
        title={<div>ยืนยันการยกเลิกรายการ</div>}
        open={isCancelModalOpen}
        onOk={() => formCancel.submit()}
        okText="ยืนยันการยกเลิก"
        onCancel={() => setIsCancelModalOpen(false)}
        cancelButtonProps={{ style: { display: "none" } }}
        okButtonProps={{ danger: true, loading: cancelLoading }}
        centered
        style={{ maxWidth: "95%" }}
      >
        <Form form={formCancel} layout="vertical" onFinish={handleCancelSubmit}>
          <Form.Item
            name="cancelReason"
            label="เหตุผลการยกเลิก"
            rules={[{ required: true, message: "กรุณากรอกเหตุผลการยกเลิก" }]}
          >
            <Input.TextArea rows={4} placeholder="กรอกเหตุผลที่ยกเลิก..." />
          </Form.Item>
        </Form>
      </Modal>

      <MaDrugEdit
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSuccess={() => fetchData()}
        data={selectedRecord}
        existingData={data}
      />
    </>
  );
}
