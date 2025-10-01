"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
} from "antd";
import { MasterLeaveType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveService } from "../services/dataLeave.service";

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
    null
  );

  /** ------------------ ADD ------------------ **/
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

  /** ------------------ EDIT ------------------ **/
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
        prev.map((item) => (item.id === updated.id ? updated : item))
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

  /** ------------------ TABLE ------------------ **/
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "ประเภทลา", dataIndex: "leaveType", key: "leaveType" },
    { title: "คำอธิบาย", dataIndex: "description", key: "description" },
    {
      title: "จัดการ",
      key: "action",
      render: (_: any, record: MasterLeaveType) => (
        <Space>
          <Button
            size="small"
            type="primary"
            onClick={() => handleEdit(record)}
          >
            แก้ไข
          </Button>

          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
            onConfirm={async () => {
              try {
                setLoading(true);
                await intraAuthService.deleteMasterLeave(record.id);
                message.success("ลบข้อมูลสำเร็จ");
                setMasterLeave((prev) =>
                  prev.filter((item) => item.id !== record.id)
                );
              } catch (error) {
                console.error("เกิดข้อผิดพลาดในการลบ:", error);
                message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
              } finally {
                setLoading(false);
              }
            }}
            okText="ใช่"
            cancelText="ยกเลิก"
          >
            <Button danger size="small">
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={handleAdd}>
        เพิ่มประเภทลา
      </Button>

      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      {/* ------------------ Modal Add ------------------ */}
      <Modal
        title="เพิ่มประเภทลา"
        open={isAddModalOpen}
        onOk={handleAddOk}
        onCancel={() => setIsAddModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="ประเภทลา"
            name="leaveType"
            rules={[{ required: true, message: "กรุณากรอกประเภทลา" }]}
          >
            <Input placeholder="เช่น ลาป่วย, ลากิจ" />
          </Form.Item>

          <Form.Item label="คำอธิบาย" name="description">
            <Input.TextArea placeholder="คำอธิบายเพิ่มเติม (ถ้ามี)" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ------------------ Modal Edit ------------------ */}
      <Modal
        title="แก้ไขประเภทลา"
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={() => setIsEditModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={loading}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="ประเภทลา"
            name="leaveType"
            rules={[{ required: true, message: "กรุณากรอกประเภทลา" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="คำอธิบาย" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
