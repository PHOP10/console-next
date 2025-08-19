"use client";

import React, { useState } from "react";
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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DataLeaveType } from "../../common";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveService } from "../services/dataLeave.service";

interface ManagementDataLeaveTableProps {
  data: DataLeaveType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setDataLeave: React.Dispatch<React.SetStateAction<DataLeaveType[]>>;
}

export default function ManagementDataLeaveTable({
  data,
  loading,
  setLoading,
  setDataLeave,
}: ManagementDataLeaveTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<DataLeaveType | null>(
    null
  );
  const [form] = Form.useForm();

  const openEditModal = (record: DataLeaveType) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      reason: record.reason,
      details: record.details,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      if (!currentRecord) return;

      const updated = await intraAuthService.updateDataLeave({
        id: currentRecord.id,
        ...values,
      });

      setDataLeave((prev) =>
        prev.map((item) => (item.id === currentRecord.id ? updated : item))
      );

      message.success("แก้ไขข้อมูลเรียบร้อย");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถแก้ไขข้อมูลได้");
    }
  };

  const handleDelete = async (record: DataLeaveType) => {
    try {
      await intraAuthService.deleteDataLeave(record.id);
      setDataLeave((prev) => prev.filter((item) => item.id !== record.id));
      message.success("ลบข้อมูลสำเร็จ");
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const handleUpdateStatus = async (record: DataLeaveType, status: string) => {
    try {
      const updated = await intraAuthService.updateDataLeave({
        id: record.id,
        status,
      });
      setDataLeave((prev) =>
        prev.map((item) => (item.id === record.id ? updated : item))
      );
      message.success(
        status === "approve" ? "อนุมัติเรียบร้อย" : "ยกเลิกเรียบร้อย"
      );
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาด");
    }
  };

  const columns: ColumnsType<DataLeaveType> = [
    { title: "เหตุผล", dataIndex: "reason", key: "reason" },
    {
      title: "วันที่เริ่มลา",
      dataIndex: "leaveDateStart",
      key: "dateStart",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "วันที่สิ้นสุด",
      dataIndex: "leaveDateEnd",
      key: "leaveDateEnd",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
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
      title: "ผู้อนุมัติ",
      dataIndex: "approvedByName",
      key: "approvedByName",
      render: (value) => value || "-",
    },
    {
      title: "รายละเอียด",
      dataIndex: "details",
      key: "details",
      render: (value) => value || "-",
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => openEditModal(record)}
          >
            แก้ไข
          </Button>

          <Popconfirm
            title="ยืนยันการลบ"
            okText="ใช่"
            cancelText="ยกเลิก"
            onConfirm={() => handleDelete(record)}
          >
            <Button danger size="small">
              ลบ
            </Button>
          </Popconfirm>

          <Popconfirm
            title="คุณต้องการอนุมัติการลาใช่หรือไม่?"
            okText="อนุมัติ"
            cancelText="ยกเลิก"
            onConfirm={() => handleUpdateStatus(record, "approve")}
            onCancel={() => handleUpdateStatus(record, "cancel")}
          >
            <Button type="primary" size="small">
              อนุมัติ
            </Button>
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
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="แก้ไขข้อมูลการลา"
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="เหตุผล"
            name="reason"
            rules={[{ required: true, message: "กรุณากรอกเหตุผล" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="รายละเอียด" name="details">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
