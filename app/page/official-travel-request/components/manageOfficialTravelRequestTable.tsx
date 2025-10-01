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
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";

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

  useEffect(() => {
    fetchCars();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await intraAuthService.deleteOfficialTravelRequest(id); // ฟังก์ชัน service ของคุณ
      message.success("ลบคำขอเรียบร้อยแล้ว");
      fetchData(); // รีเฟรชตาราง
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

  const handleShowDetail = (record: any) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRecord(null);
  };

  const handleApprove = async (record: any) => {
    try {
      // const payload = {}
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
      formCancel.resetFields(); // รีเซ็ต Form
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
    },
    {
      title: "เลขที่เอกสาร",
      dataIndex: "documentNo",
      key: "documentNo",
    },
    {
      title: "วัตถุประสงค์",
      dataIndex: "missionDetail",
      key: "missionDetail",
      // ellipsis: true,
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
      // ellipsis: true,
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
      dataIndex: "endDate",
      key: "endDate",
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
            text = "รอดำเนินการ";
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
      title: "หมมายเหตุ",
      dataIndex: "title",
      key: "title",
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
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
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
            okText="ใช่"
            cancelText="ยกเลิก"
          >
            <Button danger size="small">
              ลบ
            </Button>
          </Popconfirm>
          <Button
            size="small"
            type="primary"
            style={{
              backgroundColor:
                record.status === "pending" ? "#faad14" : "#d9d9d9",
              borderColor: record.status === "pending" ? "#faad14" : "#d9d9d9",
              color: record.status === "pending" ? "white" : "#888",
              cursor: record.status === "pending" ? "pointer" : "not-allowed",
            }}
            disabled={record.status !== "pending"}
            onClick={() => handleEdit(record)}
          >
            แก้ไข
          </Button>
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
            <Button
              type="primary"
              size="small"
              disabled={record.status !== "pending"}
              onClick={() => setOpenPopoverId(record.id)}
            >
              อนุมัติ
            </Button>
          </Popover>

          <Button
            size="small"
            type="primary"
            onClick={() => handleShowDetail(record)}
          >
            รายละเอียด
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title="แก้ไขคำขอเดินทางไปราชการ"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleUpdate}
        okText="บันทึก"
        cancelText="ยกเลิก"
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
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="วันที่สิ้นสุด"
            rules={[{ required: true }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
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
      />

      <Modal
        title="ยกเลิกคำขอไปราชการ"
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
    </>
  );
};

export default ManageOfficialTravelRequestTable;
