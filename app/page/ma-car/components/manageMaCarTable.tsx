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
  FileDoneOutlined,
  FileProtectOutlined,
  FileSearchOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import MaCarDetail from "./maCarDetail";
import MaCarEditModal from "./MaCarEditModal";
import CustomTable from "../../common/CustomTable";
import MaCarReturn from "./maCarReturn";

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

  // const handleEdit = (record: MaCarType) => {

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
    },
    {
      title: "วัตถุประสงค์",
      dataIndex: "purpose",
      key: "purpose",
      align: "center",
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
      align: "center",
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
      title: "รถที่ใช้",
      dataIndex: "masterCar",
      key: "masterCar",
      align: "center",
      render: (masterCar) =>
        masterCar ? `${masterCar.carName} (${masterCar.licensePlate})` : "-",
    },
    // ... ในส่วน columns
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
      title: "หมมายเหตุ",
      dataIndex: "note",
      key: "note",
      align: "center",
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
      align: "center",
      render: (_, record) => {
        // Logic สำหรับควบคุมการเปิด-ปิดปุ่ม
        const isPending = record.status === "pending";
        const isApprove = record.status === "approve";
        const isEdit = record.status === "edit";
        const isReturn = record.status === "return";

        return (
          <Space>
            {/* 1. ปุ่มแก้ไข: กดได้เฉพาะตอนรออนุมัติหรือรอแก้ไข */}

            {/* 2. ปุ่มอนุมัติ (Popover): กดได้เฉพาะตอนรออนุมัติเท่านั้น */}
            <Popover
              trigger={isPending ? "click" : []} // ถ้าไม่เป็น pending จะไม่แสดง Popover
              title={
                <Space>
                  <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                  <Typography.Text strong>ยืนยันการดำเนินการ ?</Typography.Text>
                </Space>
              }
              content={
                <Space style={{ display: "flex", marginTop: 13 }}>
                  <Button
                    danger
                    size="small"
                    onClick={() => {
                      setSelectedCancelRecord(record);
                      setModalCancelOpen(true);
                      setOpenPopoverId(null);
                    }}
                  >
                    ยกเลิกการจอง
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleApprove(record)}
                  >
                    อนุมัติ
                  </Button>
                </Space>
              }
              open={openPopoverId === record.id}
              onOpenChange={(open) => setOpenPopoverId(open ? record.id : null)}
            >
              <Tooltip title={isPending ? "อนุมัติ/ปฏิเสธ" : "ดำเนินการแล้ว"}>
                <CheckCircleOutlined
                  style={{
                    fontSize: 20,
                    color: isPending ? "#52c41a" : "#d9d9d9",
                    cursor: isPending ? "pointer" : "not-allowed",
                  }}
                  onClick={() => {
                    if (isPending) setOpenPopoverId(record.id);
                  }}
                />
              </Tooltip>
            </Popover>

            {/* 3. ปุ่มส่งคืนแก้ไข: กดได้เฉพาะรายการที่อนุมัติแล้วแต่ต้องการให้แก้ใหม่ */}
            <Tooltip
              title={isApprove ? "ส่งคืนให้ผู้ใช้แก้ไข" : "ส่งคืนไม่ได้"}
            >
              <Popconfirm
                title="ยืนยันการส่งคืนเพื่อแก้ไข"
                onConfirm={() => returnEdit(record)}
                disabled={!isApprove}
                okText="ยืนยัน"
                cancelText="ยกเลิก"
              >
                <RollbackOutlined
                  style={{
                    fontSize: 20,
                    color: isApprove ? "orange" : "#d9d9d9",
                    cursor: isApprove ? "pointer" : "not-allowed",
                  }}
                />
              </Popconfirm>
            </Tooltip>

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
                    fontSize: 24, // ปรับขนาดให้ใหญ่เห็นชัด
                    color: record.status === "return" ? "#722ed1" : "#d9d9d9",
                  }}
                />
              </div>
            </Tooltip>

            {/* 5. ปุ่มรายละเอียด: กดได้ทุกสถานะ */}
            <Tooltip title="รายละเอียดทั้งหมด">
              <FileSearchOutlined
                style={{ fontSize: 20, color: "#1677ff", cursor: "pointer" }}
                onClick={() => handleShowDetail(record, dataUser)}
              />
            </Tooltip>

            <Tooltip
              title={
                isPending || isEdit ? "แก้ไข" : "ไม่สามารถแก้ไขได้ในสถานะนี้"
              }
            >
              <EditOutlined
                style={{
                  fontSize: 20,
                  color: isPending || isEdit ? "#faad14" : "#d9d9d9",
                  cursor: isPending || isEdit ? "pointer" : "not-allowed",
                }}
                onClick={() => {
                  if (isPending || isEdit) handleEdit(record);
                }}
              />
            </Tooltip>

            {/* 6. ปุ่มลบ: ลบได้ทุกสถานะ (หรือปรับตามนโยบาย) */}
            <Popconfirm
              title="ยืนยันการลบ"
              description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?" // (Optional) เพิ่มคำอธิบายเพื่อให้ชัดเจนขึ้น
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
                  style={{ fontSize: 20, color: "#ff4d4f", cursor: "pointer" }}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-2 tracking-tight">
          รายการการจองรถ
        </h2>

        <hr className="border-slate-100/30 -mx-6 md:-mx-6" />
      </div>

      <CustomTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: "max-content" }}
      />
      <MaCarDetail
        open={detailModalOpen}
        onClose={handleCloseDetail}
        record={selectedRecord}
      />

      <Modal
        title="ยกเลิกการจองรถ"
        open={modalCancelOpen}
        onOk={() => formCancel.submit()}
        onCancel={() => setModalCancelOpen(false)}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
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
            <Input.TextArea placeholder="กรุณากรอกเหตุผลการยกเลิก" rows={4} />
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
        mode="admin_ack" // สำคัญมาก: ใส่ mode นี้เพื่อให้เป็นหน้าจอรับรถ
      />
    </>
  );
};

export default ManageMaCarTable;
