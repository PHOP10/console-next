"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
  Tooltip,
  Card,
} from "antd";

import type { ColumnsType } from "antd/es/table";
import { MasterLeaveType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveService } from "../services/dataLeave.service";
import { DeleteOutlined, EditOutlined, FormOutlined } from "@ant-design/icons";
import CustomTable from "../../common/CustomTable";

interface ManagementMasterLeaveTableProps {
  data: MasterLeaveType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fetchMasterLeaves?: () => Promise<void>;
  setMasterLeave: React.Dispatch<React.SetStateAction<MasterLeaveType[]>>;
  masterLeave: MasterLeaveType[];
}

export default function ManagementMasterLeaveTable({
  data,
  loading,
  setLoading,
  setMasterLeave,
}: ManagementMasterLeaveTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);

  // modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [currentRecord, setCurrentRecord] = useState<MasterLeaveType | null>(
    null,
  );

  const handleAdd = () => {
    form.resetFields();
    setIsAddModalOpen(true);
  };

  const handleAddOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const newMasterLeave = await intraAuthService.createMasterLeave(values);

      message.success("เพิ่มประเภทลาสำเร็จ");
      form.resetFields();
      setIsAddModalOpen(false);

      setMasterLeave((prev) => [...prev, newMasterLeave]);
    } catch (err) {
      message.error("ไม่สามารถเพิ่มประเภทลาได้");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: MasterLeaveType) => {
    setCurrentRecord(record);
    editForm.setFieldsValue({
      leaveType: record.leaveType,
      description: record.description,
    });
    setIsEditModalOpen(true);
  };

  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields();
      if (!currentRecord) return;

      setLoading(true);
      const payload = { id: currentRecord.id, ...values };
      const updated = await intraAuthService.updateMasterLeave(payload);

      message.success("แก้ไขประเภทลาสำเร็จ");
      setMasterLeave((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );

      setIsEditModalOpen(false);
      setCurrentRecord(null);
      editForm.resetFields();
    } catch (err) {
      message.error("ไม่สามารถแก้ไขประเภทลาได้");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await intraAuthService.deleteMasterLeave(id);
      message.success("ลบข้อมูลสำเร็จ");
      setMasterLeave((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบ:", error);
      message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<MasterLeaveType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 60,
      responsive: ["sm"], // ซ่อนบนมือถือเล็ก
    },
    {
      title: "ประเภทลา",
      dataIndex: "leaveType",
      key: "leaveType",
      align: "center",
      width: 150,
    },
    {
      title: "คำอธิบาย",
      dataIndex: "description",
      key: "description",
      align: "center",
      responsive: ["md"], // ซ่อนบนมือถือ
      render: (text) => text || "-",
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 120,
      render: (_: any, record: MasterLeaveType) => (
        <Space size="small">
          <Tooltip title="แก้ไข">
            <EditOutlined
              style={{
                fontSize: 18, // ปรับขนาดไอคอนเป็น 18px
                color: "#faad14",
                cursor: "pointer",
              }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          {/* ปุ่มลบ */}
          <Popconfirm
            title="ยืนยันการลบ"
            description="ยืนยันการลบข้อมูลรายการนี้หรือไม่?"
            onConfirm={() => handleDelete(record.id)}
            okText="ลบ"
            okButtonProps={{ danger: true }}
            cancelText="ยกเลิก"
          >
            <Tooltip title="ลบ">
              <DeleteOutlined style={{ fontSize: 18, color: "#ff4d4f" }} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-2 tracking-tight">
          ข้อมูลประเภทการลา
        </h2>
        <hr className="border-slate-100/20 -mx-6 md:-mx-6" />
      </div>

      <div className="flex justify-end mb-4 px-2">
        <Button
          type="primary"
          onClick={handleAdd}
          className="w-full sm:w-auto h-10 rounded-lg shadow-sm"
        >
          + เพิ่มประเภทการลา
        </Button>
      </div>

      <CustomTable
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        bordered
        size="small" // ใช้ size small บนมือถือ
      />

      <Modal
        title={
          <div className="text-lg sm:text-xl font-bold text-[#0683e9] text-center w-full">
            เพิ่มประเภทการลา
          </div>
        }
        open={isAddModalOpen}
        onOk={handleAddOk}
        onCancel={() => setIsAddModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={loading}
        centered
        // Responsive Modal
        width={500}
        style={{ maxWidth: "95%" }}
        styles={{
          content: { borderRadius: "16px", padding: "24px" },
          header: { marginBottom: "16px" },
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="ประเภทลา"
            name="leaveType"
            rules={[{ required: true, message: "กรุณากรอกประเภทลา" }]}
          >
            <Input
              placeholder="เช่น ลาป่วย, ลากิจ"
              className="w-full h-10 rounded-lg border-gray-300 shadow-sm"
            />
          </Form.Item>

          <Form.Item label="คำอธิบาย" name="description">
            <Input.TextArea
              placeholder="คำอธิบายเพิ่มเติม (ถ้ามี)"
              rows={3}
              className="w-full rounded-lg border-gray-300 shadow-sm"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <div className="text-lg sm:text-xl font-bold text-[#0683e9] text-center w-full">
            แก้ไขประเภทลา
          </div>
        }
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={() => setIsEditModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={loading}
        centered
        width={500}
        style={{ maxWidth: "95%" }}
        styles={{
          content: { borderRadius: "16px", padding: "24px" },
          header: { marginBottom: "16px" },
        }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="ประเภทลา"
            name="leaveType"
            rules={[{ required: true, message: "กรุณากรอกประเภทลา" }]}
          >
            <Input className="w-full h-10 rounded-lg border-gray-300 shadow-sm" />
          </Form.Item>

          <Form.Item label="คำอธิบาย" name="description">
            <Input.TextArea
              rows={3}
              className="w-full rounded-lg border-gray-300 shadow-sm"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
