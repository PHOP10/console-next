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
} from "antd";

import type { ColumnsType } from "antd/es/table";
import { MasterLeaveType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveService } from "../services/dataLeave.service";
import { DeleteOutlined, FormOutlined } from "@ant-design/icons";

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

  const columns: ColumnsType<MasterLeaveType> = [
    { title: "ID", dataIndex: "id", key: "id", align: "center" },
    {
      title: "ประเภทลา",
      dataIndex: "leaveType",
      key: "leaveType",
      align: "center",
    },
    {
      title: "คำอธิบาย",
      dataIndex: "description",
      key: "description",
      align: "center",
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      render: (_: any, record: MasterLeaveType) => (
        <Space>
          <Tooltip title="แก้ไข">
            <FormOutlined
              style={{
                fontSize: 20,
                color: "#faad14",
                cursor: "pointer",
              }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          {/* ปุ่มลบ */}
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
            onConfirm={async () => {
              try {
                setLoading(true);
                await intraAuthService.deleteMasterLeave(record.id);
                message.success("ลบข้อมูลสำเร็จ");
                setMasterLeave((prev) =>
                  prev.filter((item) => item.id !== record.id),
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
            <Tooltip title="ลบ">
              <DeleteOutlined
                style={{
                  fontSize: 20,
                  color: "#ff4d4f",
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          </Popconfirm>
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
        ข้อมูลประเภทลา
      </div>

      <Button type="primary" style={{ marginBottom: 16 }} onClick={handleAdd}>
        + เพิ่มประเภทลา
      </Button>

      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        bordered
      />

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
