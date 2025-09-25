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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { MaCarType, UserType } from "../../common";
import { maCarService } from "../services/maCar.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import MaCarDetail from "./maCarDetail";

interface MaCarTableProps {
  data: MaCarType[];
  loading: boolean;
  fetchData: () => void;
  dataUser: UserType[];
}

const ManageMaCarTable: React.FC<MaCarTableProps> = ({
  data,
  loading,
  fetchData,
  dataUser,
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

  const handleEdit = (record: MaCarType) => {
    setEditingCar(record);
    form.setFieldsValue({
      requesterName: record.requesterName,
      purpose: record.purpose,
      dateStart: record.dateStart ? dayjs(record.dateStart) : null,
      dateEnd: record.dateEnd ? dayjs(record.dateEnd) : null,
      destination: record.destination,
      passengers: record.passengers,
      budget: record.budget,
    });
    setIsModalOpen(true);
  };

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

  const handleShowDetail = (record: any, dataUser: any) => {
    setSelectedRecord({ ...record, dataUser });
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRecord(null);
  };

  const columns: ColumnsType<MaCarType> = [
    { title: "ผู้ขอใช้รถ", dataIndex: "requesterName", key: "requesterName" },
    { title: "วัตถุประสงค์", dataIndex: "purpose", key: "purpose" },
    {
      title: "วันเริ่มเดินทาง",
      dataIndex: "dateStart",
      key: "dateStart",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },
    {
      title: "วันกลับ",
      dataIndex: "dateEnd",
      key: "dateEnd",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },
    { title: "ปลายทาง", dataIndex: "destination", key: "destination" },
    { title: "จำนวนผู้โดยสาร", dataIndex: "passengers", key: "passengers" },
    {
      title: "งบประมาณ",
      dataIndex: "budget",
      key: "budget",
      render: (value) => (value ? value.toLocaleString() : "-"),
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
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
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

          {/* <Popconfirm
            title="คุณต้องการอนุมัติการจองหรือไม่?"
            okText="อนุมัติ"
            cancelText="ยกเลิก"
            onConfirm={async () => {
              try {
                await intraAuthService.updateMaCar({
                  id: record.id,
                  status: "approve",
                });
                message.success("อนุมัติเรียบร้อย");
                fetchData();
              } catch (error) {
                console.error(error);
                message.error("เกิดข้อผิดพลาด");
              }
            }}
            onCancel={async () => {
              try {
                await intraAuthService.updateMaCar({
                  id: record.id,
                  status: "cancel",
                });
                message.success("ยกเลิกเรียบร้อย");
                fetchData();
              } catch (error) {
                console.error(error);
                message.error("เกิดข้อผิดพลาด");
              }
            }}
          >
            <Button type="primary">อนุมัติ</Button>
          </Popconfirm> */}

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
            onClick={() => handleShowDetail(record, dataUser)}
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
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 800 }}
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
    </>
  );
};

export default ManageMaCarTable;
