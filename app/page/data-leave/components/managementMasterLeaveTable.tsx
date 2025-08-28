"use client";

import React, { useState, useCallback } from "react";
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
  masterLeave,
}: ManagementMasterLeaveTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "ประเภทลา", dataIndex: "leaveType", key: "leaveType" },
    { title: "คำอธิบาย", dataIndex: "description", key: "description" },
    {
      title: "จัดการ",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
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

  const handleAdd = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const newMasterLeave = await intraAuthService.createMasterLeave(values);

      message.success("เพิ่มประเภทลาสำเร็จ");
      form.resetFields();
      setIsModalOpen(false);

      setMasterLeave((prev) => [...prev, newMasterLeave]);
    } catch (err) {
      message.error("ไม่สามารถเพิ่มประเภทลาได้");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

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
      />

      <Modal
        title="เพิ่มประเภทลา"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="บันทึก"
        cancelText="ยกเลิก"
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
    </>
  );
}
