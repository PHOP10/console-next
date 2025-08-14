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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import type { MasterDrugType } from "../../common";

export default function DrugTypeTable() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  const [data, setData] = useState<MasterDrugType[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"table" | "form">("table");

  const [form] = Form.useForm();

  // สำหรับ modal แก้ไข
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MasterDrugType | null>(
    null
  );
  const [editForm] = Form.useForm();

  // ดึงข้อมูลประเภทยา
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await intraAuthService.getMasterDrugQuery();
      const drugData = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : [];
      setData(drugData);
    } catch (error) {
      console.error("โหลดข้อมูลประเภทยาไม่สำเร็จ:", error);
      message.error("ไม่สามารถดึงข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  // เพิ่มข้อมูลใหม่
  const handleAdd = async (values: Omit<MasterDrugType, "id">) => {
    try {
      const payload = {
        ...values,
        drugTypeId: Number(values.drugTypeId),
      };
      await intraAuthService.createMasterDrug(payload);
      message.success("เพิ่มประเภทยาสำเร็จ");
      form.resetFields();
      setMode("table");
      fetchData();
    } catch (error) {
      console.error("เพิ่มข้อมูลไม่สำเร็จ:", error);
      message.error("เพิ่มข้อมูลไม่สำเร็จ");
    }
  };

  // เปิด modal แก้ไข และเซ็ตค่า form
  const openEditModal = (record: MasterDrugType) => {
    setEditingRecord(record);
    editForm.setFieldsValue(record);
    setIsEditModalVisible(true);
  };

  // บันทึกข้อมูลแก้ไข
  const handleEdit = async (values: any) => {
    try {
      const payload = {
        ...values,
        id: editingRecord?.id,
        drugTypeId: Number(values.drugTypeId),
      };
      await intraAuthService.updateMasterDrug(payload);
      message.success("แก้ไขประเภทยาสำเร็จ");
      setIsEditModalVisible(false);
      setEditingRecord(null);
      fetchData();
    } catch (error) {
      console.error("แก้ไขข้อมูลไม่สำเร็จ:", error);
      message.error("แก้ไขข้อมูลไม่สำเร็จ");
    }
  };

  // ปิด modal แก้ไข
  const handleCancelEditModal = () => {
    setIsEditModalVisible(false);
    setEditingRecord(null);
  };

  useEffect(() => {
    if (mode === "table") {
      fetchData();
      form.resetFields();
    }
  }, [mode]);

  const columns: ColumnsType<MasterDrugType> = [
    { title: "ลำดับ", dataIndex: "drugTypeId", key: "drugTypeId" },
    { title: "ชื่อประเภทยา", dataIndex: "drugType", key: "drugType" },
    { title: "คำอธิบาย", dataIndex: "description", key: "description" },
    {
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
            onConfirm={async () => {
              try {
                await intraAuthService.deleteMasterDrug(record.id);
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

          <Button type="link" onClick={() => openEditModal(record)}>
            แก้ไข
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {mode === "table" ? (
        <>
          <Space style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              onClick={() => {
                form.resetFields();
                setMode("form");
              }}
            >
              + เพิ่มประเภทยา
            </Button>
          </Space>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            loading={loading}
            bordered
            pagination={{ pageSize: 10 }}
          />
        </>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
          style={{ maxWidth: 400 }}
        >
          <Form.Item
            label="รหัสประเภทยา"
            name="drugTypeId"
            rules={[{ required: true, message: "กรุณากรอกรหัสประเภทยา" }]}
          >
            <Input type="number" placeholder="เช่น 1" />
          </Form.Item>

          <Form.Item
            label="ชื่อประเภทยา"
            name="drugType"
            rules={[{ required: true, message: "กรุณากรอกชื่อประเภทยา" }]}
          >
            <Input placeholder="เช่น ยาเม็ด" />
          </Form.Item>

          <Form.Item label="คำอธิบาย" name="description">
            <Input.TextArea rows={3} placeholder="รายละเอียดเพิ่มเติม" />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit">
              บันทึก
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                setMode("table");
              }}
            >
              ยกเลิก
            </Button>
          </Space>
        </Form>
      )}

      {/* Modal แก้ไข */}
      <Modal
        title="แก้ไขประเภทยา"
        visible={isEditModalVisible}
        onCancel={handleCancelEditModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEdit}
          initialValues={editingRecord || {}}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="รหัสประเภทยา"
            name="drugTypeId"
            rules={[{ required: true, message: "กรุณากรอกรหัสประเภทยา" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="ชื่อประเภทยา"
            name="drugType"
            rules={[{ required: true, message: "กรุณากรอกชื่อประเภทยา" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="คำอธิบาย" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit">
              บันทึก
            </Button>
            <Button onClick={handleCancelEditModal}>ยกเลิก</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
