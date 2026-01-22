import React, { useState } from "react";
import {
  Button,
  message,
  Popconfirm,
  Space,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
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
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import MaCarDetail from "./maCarDetail";
import MaCarEditModal from "./MaCarEditModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<MaCarType | null>(null);
  const [form] = Form.useForm();
  const [formCancel] = Form.useForm();
  const [modalCancelOpen, setModalCancelOpen] = useState(false);
  const [selectedCancelRecord, setSelectedCancelRecord] =
    useState<MaCarType | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);

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
  //   setEditingCar(record);
  //   form.setFieldsValue({
  //     requesterName: record.requesterName,
  //     purpose: record.purpose,
  //     dateStart: record.dateStart ? dayjs(record.dateStart) : null,
  //     dateEnd: record.dateEnd ? dayjs(record.dateEnd) : null,
  //     destination: record.destination,
  //     passengers: record.passengers,
  //     budget: record.budget,
  //   });
  //   setIsModalOpen(true);
  // };

  const handleUpdate = async () => {
    try {
      if (!editingCar) return;

      const values = await form.validateFields();

      const body = {
        ...values,
        id: editingCar.id,
        dateStart: values.dateStart?.toISOString(),
        dateEnd: values.dateEnd?.toISOString(),
      };

      await intraAuthService.updateMaCar(body);

      message.success("แก้ไขข้อมูลสำเร็จ");
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating car:", error);
      message.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
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
      formCancel.resetFields(); // รีเซ็ต Form
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
            text = "รอดำเนินการ";
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
          default:
            text = status;
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
      render: (_, record) => (
        <Space>
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
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
            onConfirm={async () => {
              try {
                await intraAuthService.deleteMaCar(record.id);
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

          <Popconfirm
            title="ยืนยันการส่งคืนเพื่อแก้ไข"
            okText="ยืนยัน"
            cancelText="ยกเลิก"
            onConfirm={() => returnEdit(record)}
            disabled={record.status !== "approve"}
          >
            <Tooltip title="ส่งคืนเพื่อแก้ไข">
              <UndoOutlined
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

          {/* <Button
            size="small"
            type="primary"
            onClick={() => handleShowDetail(record, dataUser)}
          >
            รายละเอียด
          </Button> */}
          <Tooltip title="รายละเอียด">
            <FileSearchOutlined
              style={{ fontSize: 22, color: "#1677ff", cursor: "pointer" }}
              onClick={() => handleShowDetail(record, dataUser)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          textAlign: "center",
          fontSize: "20px",
          fontWeight: "bold",
          color: "#0683e9",
          marginTop: "-12px",

          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "12px",
          marginBottom: "24px",

          marginLeft: "-24px",
          marginRight: "-24px",
        }}
      >
        จัดการการจองรถ
      </div>

      <Table
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
        title="แก้ไขการจองรถ"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleUpdate}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="requesterName" label="ผู้ขอใช้รถ">
            <Input />
          </Form.Item>
          <Form.Item name="purpose" label="วัตถุประสงค์">
            <Input />
          </Form.Item>
          <Form.Item name="dateStart" label="วันเริ่มเดินทาง">
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="dateEnd" label="วันกลับ">
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="destination" label="ปลายทาง">
            <Input />
          </Form.Item>
          <Form.Item name="passengers" label="จำนวนผู้โดยสาร">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="budget" label="งบประมาณ">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

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
    </>
  );
};

export default ManageMaCarTable;
