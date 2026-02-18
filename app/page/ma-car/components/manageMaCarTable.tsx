"use client";

import React, { useState } from "react";
import {
  Button,
  message,
  Popconfirm,
  Space,
  Modal,
  Form,
  Input,
  Tag,
  Popover,
  Typography,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { MaCarType, MasterCarType, UserType } from "../../common";
import { maCarService } from "../services/maCar.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import {
  CarOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import MaCarDetail from "./maCarDetail";
import MaCarEditModal from "./MaCarEditModal";
import CustomTable from "../../common/CustomTable";
import MaCarReturn from "./maCarReturn";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Setup dayjs
dayjs.extend(buddhistEra);
dayjs.locale("th");

interface MaCarTableProps {
  data: MaCarType[];
  loading: boolean;
  fetchData: () => void;
  dataUser: UserType[];
  cars: MasterCarType[];
  maCarUser: MaCarType[];
}

const ManageMaCarTable: React.FC<MaCarTableProps> = ({
  data,
  loading,
  fetchData,
  dataUser,
  cars,
  maCarUser,
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);
  const { data: session } = useSession();
  const [form] = Form.useForm();
  const [formCancel] = Form.useForm();
  const [modalCancelOpen, setModalCancelOpen] = useState(false);
  const [selectedCancelRecord, setSelectedCancelRecord] =
    useState<MaCarType | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [selectedAckRecord, setSelectedAckRecord] = useState<MaCarType | null>(
    null,
  );

  const handleShowDetail = (record: any, dataUser: any) => {
    setSelectedRecord({ ...record, dataUser });
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRecord(null);
  };

  const handleEdit = (record: any) => {
    setEditRecord(record);
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditRecord(null);
  };

  const handleShowAcknowledge = (record: MaCarType) => {
    setSelectedAckRecord(record);
    setAckModalOpen(true);
  };

  const handleApprove = async (record: any) => {
    try {
      await intraAuthService.updateMaCar({
        id: record.id,
        status: "approve",
        approvedByName: session?.user?.fullName,
        approvedAt: new Date().toISOString(),
      });
      message.success("อนุมัติรายการนี้แล้ว");
      setOpenPopoverId(null);
      fetchData();
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
      await intraAuthService.updateMaCar({
        id: selectedCancelRecord.id,
        cancelName: session?.user?.fullName,
        cancelAt: new Date().toISOString(),
        status: "cancel",
        cancelReason: values.cancelReason,
      });
      message.success("ยกเลิกรายการแล้ว");
      setModalCancelOpen(false);
      formCancel.resetFields();
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาด");
    }
  };

  const returnEdit = async (record: any) => {
    try {
      await intraAuthService.updateMaCar({
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

  const columns: ColumnsType<MaCarType> = [
    {
      title: "ผู้ขอใช้รถ",
      dataIndex: "createdName",
      key: "createdName",
      align: "center",
      width: 150,
    },
    {
      title: "วัตถุประสงค์",
      dataIndex: "purpose",
      key: "purpose",
      align: "center",
      width: 150,
      responsive: ["md"], // ซ่อนบนมือถือ
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
      title: "ปลายทาง",
      dataIndex: "destination",
      key: "destination",
      align: "center",
      width: 150,
      responsive: ["lg"], // ซ่อนบนมือถือ
      render: (text: string) => {
        const maxLength = 20;
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
              {dateObj.format("D MMMM BBBB")}
            </span>
          </>
        );
      },
    },
    {
      title: "รถที่ใช้",
      dataIndex: "masterCar",
      key: "masterCar",
      align: "center",
      width: 150,
      responsive: ["xl"], // ซ่อนบนมือถือ
      render: (masterCar) =>
        masterCar ? `${masterCar.carName} (${masterCar.licensePlate})` : "-",
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
          case "edit":
            color = "orange";
            text = "รอแก้ไข";
            break;
          case "cancel":
            color = "red";
            text = "ยกเลิก";
            break;
          case "return":
            color = "purple";
            text = "คืนรถแล้ว";
            break;
          case "success":
            color = "default";
            text = "เสร็จสิ้น";
            break;
          default:
            text = status;
            color = "default";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 180, // เพิ่มความกว้างให้ปุ่มเรียงสวย
      render: (_, record) => {
        const isPending = record.status === "pending";
        const isApprove = record.status === "approve";
        const isEdit = record.status === "edit";
        const isReturn = record.status === "return";

        return (
          <Space size="small">
            {/* 1. ปุ่มอนุมัติ (Popover) */}
            <Popover
              trigger={isPending ? "click" : []}
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
                    onClick={() => {
                      setSelectedCancelRecord(record);
                      setModalCancelOpen(true);
                      setOpenPopoverId(null);
                      formCancel.resetFields();
                    }}
                  >
                    ยกเลิก
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
              open={openPopoverId === record.id}
              onOpenChange={(open) => setOpenPopoverId(open ? record.id : null)}
            >
              <Tooltip title={isPending ? "อนุมัติ" : "อนุมัติแล้ว"}>
                <CheckCircleOutlined
                  style={{
                    fontSize: 18, // ขนาด 18px
                    color: isPending ? "#52c41a" : "#d9d9d9",
                    cursor: isPending ? "pointer" : "not-allowed",
                  }}
                  onClick={(e) => {
                    if (isPending) setOpenPopoverId(record.id);
                  }}
                />
              </Tooltip>
            </Popover>

            {/* 2. ปุ่มส่งคืนแก้ไข */}
            <Tooltip
              title={isApprove ? "ส่งคืนให้ผู้ใช้แก้ไข" : "ส่งคืนไม่ได้"}
            >
              <Popconfirm
                title="ยืนยันการส่งคืนเพื่อแก้ไข ?"
                onConfirm={() => returnEdit(record)}
                disabled={!isApprove}
                okText="ยืนยัน"
                cancelText="ยกเลิก"
              >
                <RollbackOutlined
                  style={{
                    fontSize: 18, // ขนาด 18px
                    color: isApprove ? "orange" : "#d9d9d9",
                    cursor: isApprove ? "pointer" : "not-allowed",
                  }}
                />
              </Popconfirm>
            </Tooltip>

            {/* 3. ปุ่มรับทราบการคืนรถ */}
            <Tooltip
              title={
                record.status === "return"
                  ? "ตรวจสอบสภาพรถและรับคืน"
                  : record.status === "success"
                    ? "รับรถคืนสำเร็จแล้ว"
                    : "รอนำรถมาคืน"
              }
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  cursor:
                    record.status === "return" ? "pointer" : "not-allowed",
                  opacity: record.status === "return" ? 1 : 0.6,
                }}
                onClick={() => {
                  if (record.status === "return") handleShowAcknowledge(record);
                }}
              >
                <CarOutlined
                  style={{
                    fontSize: 18, // ขนาด 18px
                    color: record.status === "return" ? "#722ed1" : "#d9d9d9",
                  }}
                />
              </div>
            </Tooltip>

            {/* 4. ปุ่มรายละเอียด */}
            <Tooltip title="รายละเอียดทั้งหมด">
              <FileSearchOutlined
                style={{ fontSize: 18, color: "#1677ff", cursor: "pointer" }} // ขนาด 18px
                onClick={() => handleShowDetail(record, dataUser)}
              />
            </Tooltip>

            {/* 5. ปุ่มแก้ไข */}
            {/* <Tooltip
              title={
                isPending || isEdit ? "แก้ไข" : "ไม่สามารถแก้ไขได้ในสถานะนี้"
              }
            >
              <EditOutlined
                style={{
                  fontSize: 18, // ขนาด 18px
                  color: isPending || isEdit ? "#faad14" : "#d9d9d9",
                  cursor: isPending || isEdit ? "pointer" : "not-allowed",
                }}
                onClick={() => {
                  if (isPending || isEdit) handleEdit(record);
                }}
              />
            </Tooltip> */}

            {/* 6. ปุ่มลบ */}
            {/* <Popconfirm
              title="ยืนยันการลบ"
              description="ยืนยันการลบข้อมูลรายการนี้หรือไม่?"
              onConfirm={async () => {
                try {
                  await intraAuthService.deleteMaCar(record.id);
                  message.success("ลบข้อมูลสำเร็จ");
                  fetchData();
                } catch (error) {
                  message.error("เกิดข้อผิดพลาดในการลบ");
                }
              }}
              okText="ยืนยัน"
              cancelText="ยกเลิก"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="ลบรายการ">
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
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-2 tracking-tight">
          จัดการรายการจองรถ
        </h2>
        <hr className="border-slate-100/30 -mx-6 md:-mx-6" />
      </div>

      <CustomTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        bordered
        // Responsive config
        scroll={{ x: "max-content" }}
        size="small" // ใช้ size small บนมือถือ
        pagination={{ pageSize: 10, size: "small" }}
      />
      <MaCarDetail
        open={detailModalOpen}
        onClose={handleCloseDetail}
        record={selectedRecord}
        dataUser={dataUser}
      />

      <Modal
        title="ยืนยันการยกเลิกรายการ"
        open={modalCancelOpen}
        onOk={() => formCancel.submit()}
        onCancel={() => setModalCancelOpen(false)}
        okText="ยืนยันการยกเลิก"
        cancelButtonProps={{ style: { display: "none" } }}
        okButtonProps={{ danger: true }}
        centered
        style={{ maxWidth: "95%" }}
      >
        <Form
          form={formCancel}
          layout="vertical"
          onFinish={(values) => handleConfirmCancel(values)}
        >
          <Form.Item
            label="เหตุผลการยกเลิก"
            name="cancelReason"
            rules={[{ required: true, message: "กรุณากรอกเหตุผลการยกเลิก" }]}
          >
            <Input.TextArea placeholder="กรอกเหตุผลที่ยกเลิก..." rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <MaCarEditModal
        open={editModalOpen}
        onClose={handleCloseEdit}
        record={editRecord}
        cars={cars}
        dataUser={dataUser}
        fetchData={fetchData}
        maCarUser={maCarUser}
        data={data}
      />

      <MaCarReturn
        open={ackModalOpen}
        onClose={() => setAckModalOpen(false)}
        record={selectedAckRecord}
        fetchData={fetchData}
        mode="admin_ack"
      />
    </>
  );
};

export default ManageMaCarTable;
