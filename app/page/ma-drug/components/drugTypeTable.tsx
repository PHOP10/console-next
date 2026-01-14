"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Modal,
  Card,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import type { MasterDrugType } from "../../common";

export default function DrugTypeTable() {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  // --- States ---
  const [data, setData] = useState<MasterDrugType[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State (ใช้ร่วมกันทั้ง เพิ่ม และ แก้ไข)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MasterDrugType | null>(
    null
  );
  const [submitLoading, setSubmitLoading] = useState(false);

  // --- Actions ---

  // โหลดข้อมูล
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await intraAuthService.getMasterDrugQuery();
      const drugData = Array.isArray(result)
        ? result
        : Array.isArray((result as any)?.data)
        ? (result as any).data
        : [];
      setData(drugData);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("ไม่สามารถดึงข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // เปิด Modal สำหรับ "เพิ่มข้อมูล"
  const handleOpenAdd = () => {
    setEditingRecord(null); // เคลียร์ record เพื่อระบุว่าเป็นโหมดเพิ่ม
    form.resetFields();
    setIsModalOpen(true);
  };

  // เปิด Modal สำหรับ "แก้ไขข้อมูล"
  const handleOpenEdit = (record: MasterDrugType) => {
    setEditingRecord(record); // ใส่ record เพื่อระบุว่าเป็นโหมดแก้ไข
    form.setFieldsValue(record); // set ค่าเดิมลงฟอร์ม
    setIsModalOpen(true);
  };

  // ฟังก์ชันบันทึก (ทำงานทั้ง Add และ Edit)
  const handleSave = async (values: any) => {
    try {
      setSubmitLoading(true);
      const payload = {
        ...values,
        drugTypeId: Number(values.drugTypeId), // แปลงเป็นตัวเลข
      };

      if (editingRecord) {
        // --- โหมดแก้ไข ---
        await intraAuthService.updateMasterDrug({
          ...payload,
          id: editingRecord.id,
        });
        message.success("แก้ไขข้อมูลสำเร็จ");
      } else {
        // --- โหมดเพิ่ม ---
        await intraAuthService.createMasterDrug(payload);
        message.success("เพิ่มข้อมูลสำเร็จ");
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchData(); // โหลดตารางใหม่
    } catch (error) {
      console.error("Save error:", error);
      message.error("บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ลบข้อมูล
  const handleDelete = async (id: number) => {
    try {
      await intraAuthService.deleteMasterDrug(id);
      message.success("ลบข้อมูลสำเร็จ");
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  // --- Columns Config ---
  const columns: ColumnsType<MasterDrugType> = [
    {
      title: "รหัสประเภท",
      dataIndex: "drugTypeId",
      key: "drugTypeId",
      align: "center",
      width: 150,
      sorter: (a, b) => a.drugTypeId - b.drugTypeId,
    },
    {
      title: "ชื่อประเภทยา",
      dataIndex: "drugType",
      key: "drugType",
    },
    {
      title: "คำอธิบาย",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-", // ถ้าไม่มีข้อมูลให้โชว์ขีด
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenEdit(record)}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
            onConfirm={() => handleDelete(record.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      bordered={false}
      className="shadow-sm"
      title={
        <div
          style={{
            color: "#0683e9",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>จัดการประเภทยา</span>
        </div>
      }
    >
      {/* ปุ่มเพิ่มข้อมูลอยู่เหนือตาราง */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAdd}
          size="small"
        >
          เพิ่มประเภทยา
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
        size="middle"
      />

      {/* Modal สำหรับทั้ง เพิ่ม และ แก้ไข */}
      <Modal
        title={
          editingRecord ? (
            <span>
              <EditOutlined /> แก้ไขประเภทยา
            </span>
          ) : (
            <span>
              <PlusOutlined /> เพิ่มประเภทยาใหม่
            </span>
          )
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()} // สั่ง submit form เมื่อกดปุ่ม OK ของ Modal
        confirmLoading={submitLoading}
        okText="บันทึก"
        cancelText="ยกเลิก"
        destroyOnClose
      >
        <Divider style={{ margin: "12px 0" }} />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          preserve={false} // รีเซ็ตค่าเมื่อปิด Modal
        >
          <Form.Item
            label="รหัสประเภทยา (ID)"
            name="drugTypeId"
            rules={[{ required: true, message: "กรุณากรอกรหัสประเภทยา" }]}
          >
            <Input type="number" placeholder="เช่น 101" />
          </Form.Item>

          <Form.Item
            label="ชื่อประเภทยา"
            name="drugType"
            rules={[{ required: true, message: "กรุณากรอกชื่อประเภทยา" }]}
          >
            <Input placeholder="เช่น ยาเม็ด, ยาน้ำ" />
          </Form.Item>

          <Form.Item label="คำอธิบายเพิ่มเติม" name="description">
            <Input.TextArea rows={3} placeholder="รายละเอียด (ถ้ามี)" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
