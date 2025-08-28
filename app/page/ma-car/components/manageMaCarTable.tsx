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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { MaCarType } from "../../common";
import { maCarService } from "../services/maCar.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import dayjs from "dayjs";

interface MaCarTableProps {
  data: MaCarType[];
  loading: boolean;
  fetchData: () => void;
}

const ManageMaCarTable: React.FC<MaCarTableProps> = ({
  data,
  loading,
  fetchData,
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<MaCarType | null>(null);
  const [form] = Form.useForm();

  const handleEdit = (record: MaCarType) => {
    setEditingCar(record);
    form.setFieldsValue({
      requesterName: record.requesterName,
      purpose: record.purpose,
      departureDate: record.departureDate ? dayjs(record.departureDate) : null,
      returnDate: record.returnDate ? dayjs(record.returnDate) : null,
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
        departureDate: values.departureDate?.toISOString(),
        returnDate: values.returnDate?.toISOString(),
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

  const columns: ColumnsType<MaCarType> = [
    { title: "ผู้ขอใช้รถ", dataIndex: "requesterName", key: "requesterName" },
    { title: "วัตถุประสงค์", dataIndex: "purpose", key: "purpose" },
    {
      title: "วันเริ่มเดินทาง",
      dataIndex: "departureDate",
      key: "departureDate",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },
    {
      title: "วันกลับ",
      dataIndex: "returnDate",
      key: "returnDate",
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
          <Popconfirm
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
          </Popconfirm>
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
          <Form.Item name="departureDate" label="วันเริ่มเดินทาง">
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="returnDate" label="วันกลับ">
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
    </>
  );
};

export default ManageMaCarTable;
