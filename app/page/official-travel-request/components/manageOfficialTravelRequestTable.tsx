"use client";

import React, { useState, useEffect } from "react";
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
  Select,
  Popover,
  Typography,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { OfficialTravelRequestType, UserType } from "../../common";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import dayjs from "dayjs";
import OfficialTravelRequestDetail from "./officialTravelRequestDetail";
import OfficialTravelRequestEditModal from "./OfficialTravelRequestEditModal";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import CustomTable from "../../common/CustomTable";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Setup dayjs
dayjs.extend(buddhistEra);
dayjs.locale("th");

interface Props {
  data: OfficialTravelRequestType[];
  loading: boolean;
  fetchData: () => void;
  dataUser: UserType[];
}

const ManageOfficialTravelRequestTable: React.FC<Props> = ({
  data,
  loading,
  fetchData,
  dataUser,
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = officialTravelRequestService(intraAuth);
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [formCancel] = Form.useForm();
  const [cars, setCars] = useState<any[]>([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [modalCancelOpen, setModalCancelOpen] = useState(false);
  const [selectedCancelRecord, setSelectedCancelRecord] =
    useState<OfficialTravelRequestType | null>(null);

  // โหลดรายการรถจาก master car
  const fetchCars = async () => {
    try {
      const res = await intraAuthService.getMasterCarQuery();
      setCars(res);
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถโหลดข้อมูลรถได้");
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

  useEffect(() => {
    fetchCars();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await intraAuthService.deleteOfficialTravelRequest(id);
      message.success("ลบคำขอเรียบร้อยแล้ว");
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("ลบคำขอไม่สำเร็จ");
    }
  };

  const handleEdit = (record: any) => {
    if (record.status !== "pending") return;
    setEditRecord(record);
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditRecord(null);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await intraAuthService.updateOfficialTravelRequest({
        id: editRecord?.id,
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      });
      message.success("แก้ไขข้อมูลสำเร็จ");
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
  };

  const returnEdit = async (record: any) => {
    try {
      await intraAuthService.updateOfficialTravelRequest({
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
      await intraAuthService.updateOfficialTravelRequest({
        id: record.id,
        status: "approve",
        approvedByName: session?.user?.fullName,
        approvedDate: new Date().toISOString(),
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
      await intraAuthService.updateOfficialTravelRequest({
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

  const columns: ColumnsType<OfficialTravelRequestType> = [
    {
      title: "ผู้ยื่นคำขอ",
      dataIndex: "createdName",
      key: "createdName",
      align: "center",
      width: 150,
    },
    {
      title: "เลขที่เอกสาร",
      dataIndex: "documentNo",
      key: "documentNo",
      align: "center",
      width: 120,
    },
    {
      title: "วัตถุประสงค์",
      dataIndex: "missionDetail",
      key: "missionDetail",
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
      title: "สถานที่",
      dataIndex: "location",
      key: "location",
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
      dataIndex: "startDate",
      key: "startDate",
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
      dataIndex: "endDate",
      key: "endDate",
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
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 100,
      render: (status: string) => {
        let color = "default";
        let text = status;

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
            break;
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
      ellipsis: true,
      responsive: ["xl"], // ซ่อนบนมือถือและจอเล็ก
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
      width: 180, // เพิ่มความกว้างให้ปุ่ม
      render: (_, record) => (
        <Space size="small">
          <Popover
            trigger="click"
            open={openPopoverId === record.id}
            onOpenChange={(newOpen) => {
              if (newOpen && record.status === "pending") {
                setOpenPopoverId(record.id);
              } else {
                setOpenPopoverId(null);
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
                  marginTop: 13,
                  justifyContent: "flex-end",
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
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                  }}
                  onClick={() => {
                    handleApprove(record);
                    setOpenPopoverId(null);
                  }}
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
                  fontSize: 18, // ขนาด 18px
                  color: record.status === "pending" ? "#52c41a" : "#d9d9d9",
                  cursor:
                    record.status === "pending" ? "pointer" : "not-allowed",
                  opacity: record.status === "pending" ? 1 : 0.5,
                  transition: "color 0.2s",
                }}
                onClick={(e) => {
                  if (record.status !== "pending") {
                    e.stopPropagation();
                    return;
                  }
                  setOpenPopoverId(record.id);
                }}
              />
            </Tooltip>
          </Popover>
          <Popconfirm
            title="ยืนยันการส่งคืนเพื่อแก้ไข ?"
            okText="ยืนยัน"
            cancelText="ยกเลิก"
            onConfirm={() => returnEdit(record)}
            disabled={record.status !== "approve"}
          >
            <Tooltip title="ส่งคืนเพื่อแก้ไข">
              <RollbackOutlined
                style={{
                  fontSize: 18, // ขนาด 18px
                  color: record.status === "approve" ? "orange" : "#d9d9d9",
                  cursor:
                    record.status === "approve" ? "pointer" : "not-allowed",
                  transition: "color 0.2s",
                }}
              />
            </Tooltip>
          </Popconfirm>

          <Tooltip title="รายละเอียด">
            <FileSearchOutlined
              style={{ fontSize: 18, color: "#1677ff", cursor: "pointer" }}
              onClick={() => handleShowDetail(record)}
            />
          </Tooltip>

          {/* <Tooltip title="แก้ไข">
            <EditOutlined
              style={{
                fontSize: 18, // ขนาด 18px
                color: record.status === "pending" ? "#faad14" : "#d9d9d9",
                cursor: record.status === "pending" ? "pointer" : "not-allowed",
                transition: "color 0.2s",
              }}
              onClick={() => {
                if (record.status === "pending") {
                  handleEdit(record);
                }
              }}
            />
          </Tooltip> */}

          {/* <Popconfirm
            title="ยืนยันการลบ"
            description="ยืนยันการลบข้อมูลรายการนี้หรือไม่?"
            onConfirm={async () => {
              try {
                await intraAuthService.deleteOfficialTravelRequest(record.id);
                message.success("ลบข้อมูลสำเร็จ");
                fetchData();
              } catch (error) {
                console.error("เกิดข้อผิดพลาดในการลบ:", error);
                message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
              }
            }}
            okText="ลบ"
            cancelText="ยกเลิก"
          >
            <Tooltip title="ลบ">
              <DeleteOutlined
                style={{
                  fontSize: 18, // ขนาด 18px
                  color: "#ff4d4f",
                  cursor: "pointer",
                  transition: "color 0.2s",
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
          จัดการคำขอไปราชการ
        </h2>
        <hr className="border-slate-100/30 -mx-6 md:-mx-6" />
      </div>

      <CustomTable
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        // Responsive Config
        scroll={{ x: "max-content" }}
        size="small" // ใช้ size small บนมือถือ
        pagination={{ pageSize: 10, size: "small" }}
      />

      <Modal
        title="แก้ไขคำขอเดินทางไปราชการ"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleUpdate}
        okText="บันทึก"
        cancelText="ยกเลิก"
        centered
        style={{ maxWidth: "95%" }} // Responsive Modal
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="เรื่อง" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="missionDetail"
            label="รายละเอียดภารกิจ"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="location"
            label="สถานที่"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="วันที่เริ่ม"
            rules={[{ required: true }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="วันที่สิ้นสุด"
            rules={[{ required: true }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name="carId" label="รถที่ใช้">
            <Select allowClear placeholder="เลือกรถ">
              {cars.map((car) => (
                <Select.Option key={car.id} value={car.id}>
                  {car.licensePlate} ({car.brand} {car.model})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <OfficialTravelRequestDetail
        open={detailModalOpen}
        onClose={handleCloseDetail}
        record={selectedRecord}
        dataUser={dataUser}
      />
      <OfficialTravelRequestEditModal
        open={editModalOpen}
        onClose={handleCloseEdit}
        record={editRecord}
        fetchData={fetchData}
        dataUser={dataUser}
        cars={cars}
        dataOTR={data}
      />

      <Modal
        title="ยืนยันการยกเลิกรายการ"
        open={modalCancelOpen}
        onOk={() => formCancel.submit()}
        onCancel={() => setModalCancelOpen(false)}
        okText="ยืนยันการยกเลิก"
        cancelButtonProps={{ style: { display: "none" } }}
        centered
        okButtonProps={{ danger: true }}
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
            <Input.TextArea placeholder="กรุณากรอกเหตุผลการยกเลิก" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ManageOfficialTravelRequestTable;
