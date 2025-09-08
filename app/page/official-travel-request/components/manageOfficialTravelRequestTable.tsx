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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { OfficialTravelRequestType } from "../../common";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import dayjs from "dayjs";

interface Props {
  data: OfficialTravelRequestType[];
  loading: boolean;
  fetchData: () => void;
}

const ManageOfficialTravelRequestTable: React.FC<Props> = ({
  data,
  loading,
  fetchData,
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = officialTravelRequestService(intraAuth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRecord, setEditRecord] =
    useState<OfficialTravelRequestType | null>(null);
  const [form] = Form.useForm();
  const [cars, setCars] = useState<any[]>([]);

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

  const handleEdit = (record: OfficialTravelRequestType) => {
    setEditRecord(record);
    form.setFieldsValue({
      ...record,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
    });
    setIsModalOpen(true);
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

  const handleDelete = async (id: number) => {
    try {
      await intraAuthService.deleteOfficialTravelRequest(id);
      message.success("ลบข้อมูลสำเร็จ");
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await intraAuthService.updateOfficialTravelRequest({ id, status });
      message.success("อัปเดตสถานะเรียบร้อย");
      fetchData();
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  const columns: ColumnsType<OfficialTravelRequestType> = [
    {
      title: "เลขที่เอกสาร",
      dataIndex: "documentNo",
      key: "documentNo",
    },
    {
      title: "เรื่อง",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "รายละเอียดภารกิจ",
      dataIndex: "missionDetail",
      key: "missionDetail",
    },
    {
      title: "สถานที่",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "วันที่เริ่ม",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "วันที่สิ้นสุด",
      dataIndex: "endDate",
      key: "endDate",
      render: (text) => new Date(text).toLocaleDateString(),
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
      title: "รถที่ใช้",
      dataIndex: ["MasterCar", "licensePlate"],
      key: "licensePlate",
      render: (_, record) =>
        record.MasterCar ? `${record.MasterCar.licensePlate} ` : "-",
    },
    {
      title: "ผู้อนุมัติ",
      dataIndex: "approvedByName",
      key: "approvedByName",
      render: (text) => text || "-",
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
            onConfirm={() => handleDelete(record.id)}
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
            onConfirm={() => handleUpdateStatus(record.id, "approve")}
            onCancel={() => handleUpdateStatus(record.id, "cancel")}
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
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: 800 }}
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
    </>
  );
};

export default ManageOfficialTravelRequestTable;
