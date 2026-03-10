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
  const [modalReturnOpen, setModalReturnOpen] = useState(false);
  const [selectedReturnRecord, setSelectedReturnRecord] =
    useState<MaCarType | null>(null);
  const [formReturn] = Form.useForm();

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
      message.error("กรุณากรอกเหตุผลการไม่อนุมัติ");
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
      message.success("ไม่อนุมัติรายการแล้ว");
      setModalCancelOpen(false);
      formCancel.resetFields();
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาด");
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
      await intraAuthService.updateMaCar({
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

  const columns: ColumnsType<MaCarType> = [
    {
      title: "ผู้ขอใช้รถ",
      dataIndex: "createdById",
      key: "createdById",
      align: "center",
      width: 150,
      render: (createdById: string) => {
        const foundUser = dataUser.find((u) => u.userId === createdById);

        return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : "-";
      },
    },
    {
      title: "วัตถุประสงค์",
      dataIndex: "purpose",
      key: "purpose",
      align: "center",
      width: 150,
      responsive: ["md"],
      render: (text: string) => {
        const maxLength = 25;
        if (!text) return "-";
        return text.length > maxLength ? (
          <Tooltip placement="topLeft" title={text}>
            <span className="font-normal cursor-pointer text-gray-700">
              {text.slice(0, maxLength) + "..."}
            </span>
          </Tooltip>
        ) : (
          <span className="font-normal text-gray-700">{text}</span>
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
            <span className="font-normal cursor-pointer text-gray-700">
              {text.slice(0, maxLength) + "..."}
            </span>
          </Tooltip>
        ) : (
          <span className="font-normal text-gray-700">{text}</span>
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
      render: (masterCar) => (masterCar ? `${masterCar.licensePlate}` : "-"),
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
            text = "ไม่อนุมัติ";
            break;
          case "return":
            color = "purple";
            text = "คืนรถแล้ว";
            break;
          case "success":
            color = "default";
            text = "เสร็จสิ้น";
            break;
          case "resubmitted":
            color = "geekblue";
            text = "รออนุมัติ (แก้ไขแล้ว)";
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
              trigger="click"
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
                      formCancel.resetFields(); // อิงตามโค้ดชุดแรกของคุณที่ใช้ formCancel
                    }}
                  >
                    ไม่อนุมัติ
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
              onOpenChange={(visible) => {
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

                    color:
                      record.status === "pending" ||
                      record.status === "resubmitted"
                        ? "#52c41a"
                        : "#d9d9d9",

                    cursor:
                      record.status === "pending" ||
                      record.status === "resubmitted"
                        ? "pointer"
                        : "not-allowed",
                  }}
                  onClick={(e) => {
                    if (
                      record.status !== "pending" &&
                      record.status !== "resubmitted"
                    ) {
                      e.stopPropagation();
                    } else {
                      setOpenPopoverId(record.id);
                    }
                  }}
                />
              </Tooltip>
            </Popover>
            {/* 2. ปุ่มส่งคืนแก้ไข */}
            <Tooltip
              title={record.status === "approve" ? "ส่งคืนเพื่อแก้ไข" : ""}
            >
              <RollbackOutlined
                style={{
                  fontSize: 18,
                  color: record.status === "approve" ? "#faad14" : "#d9d9d9",
                  cursor:
                    record.status === "approve" ? "pointer" : "not-allowed",
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

            {/* 3. ปุ่มรับทราบการคืนรถ */}
            <Tooltip title={"รับคืนรถ"}>
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
            <Tooltip title="รายละเอียด">
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
        title="ยืนยันการไม่อนุมัติรายการ"
        open={modalCancelOpen}
        onOk={() => formCancel.submit()}
        onCancel={() => setModalCancelOpen(false)}
        okText="ยืนยัน"
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
            label="เหตุผลการไม่อนุมัติ"
            name="cancelReason"
            rules={[
              { required: true, message: "กรุณากรอกเหตุผลการไม่อนุมัติ" },
            ]}
          >
            <Input.TextArea placeholder="กรอกเหตุผลที่ไม่อนุมัติ..." rows={4} />
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
};

export default ManageMaCarTable;
