"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Card,
  Modal,
  Form,
  Input,
  InputNumber,
  Select, // ✅ เพิ่ม Select
  Tag,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType, MasterDrugType } from "../../common"; // ✅ import MasterDrugType

interface DrugTableProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  data: DrugType[];
  setData: React.Dispatch<React.SetStateAction<DrugType[]>>;
}

export default function DrugTable({
  setLoading,
  loading,
  data,
  setData,
}: DrugTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  // --- State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DrugType | null>(null);
  const [form] = Form.useForm();

  // ✅ State สำหรับเก็บรายชื่อประเภทยา เพื่อนำมาเทียบชื่อแสดงในตาราง
  const [masterDrugs, setMasterDrugs] = useState<MasterDrugType[]>([]);

  // ✅ โหลดข้อมูล MasterDrug เมื่อ Component เริ่มทำงาน
  useEffect(() => {
    const fetchMasterDrugs = async () => {
      try {
        const res: MasterDrugType[] =
          await intraAuthService.getMasterDrugQuery();
        if (Array.isArray(res)) {
          setMasterDrugs(res);
        }
      } catch (error) {
        console.error("Failed to load master drugs", error);
      }
    };
    fetchMasterDrugs();
  }, []);

  // --- Functions ---
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await intraAuthService.deleteMaDrug(id);
      message.success("ลบข้อมูลสำเร็จ");
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      message.error("ลบข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record: DrugType) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleUpdate = async (values: any) => {
    if (!editingRecord) return;
    try {
      setLoading(true);
      const payload = {
        ...editingRecord,
        ...values,
        id: editingRecord.id,
      };

      const updatedData = await intraAuthService.updateDrug(payload);
      message.success("แก้ไขข้อมูลสำเร็จ");

      setData((prev) =>
        prev.map((item) => (item.id === editingRecord.id ? updatedData : item))
      );

      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error(error);
      message.error("แก้ไขข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // --- Columns ---
  const columns: ColumnsType<DrugType> = [
    {
      title: "รหัสยา",
      dataIndex: "workingCode",
      key: "workingCode",
      align: "center",
      width: 100,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "ชื่อยา",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "ประเภทยา", // ✅ เปลี่ยนหัวข้อ
      dataIndex: "drugTypeId",
      key: "drugTypeId",
      align: "center",
      width: 150,
      // ✅ ใช้ render เพื่อเทียบ ID กับ list masterDrugs
      render: (id) => {
        // หา object ใน masterDrugs ที่มี drugTypeId ตรงกับ id ของแถวนี้
        const match = masterDrugs.find(
          (m) => m.drugTypeId === id || m.id === id
        );
        return match ? (
          <Tag color="blue">{match.drugType}</Tag> // เจอ: แสดงชื่อ (ใส่ Tag สวยๆ)
        ) : (
          <span style={{ color: "gray" }}>{id}</span> // ไม่เจอ: แสดง ID เดิมไปก่อน
        );
      },
    },
    {
      title: "ขนาดบรรจุ",
      dataIndex: "packagingSize",
      key: "packagingSize",
      align: "center",
    },
    {
      title: "ราคา/หน่วย",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (value) =>
        Number(value).toLocaleString("th-TH", {
          style: "currency",
          currency: "THB",
        }),
    },
    {
      title: "คงเหลือ",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (value) => (
        <span
          style={{
            color: value <= 10 ? "red" : "inherit",
            fontWeight: value <= 10 ? "bold" : "normal",
          }}
        >
          {Number(value).toLocaleString()}
        </span>
      ), // เพิ่มลูกเล่น ถ้าเหลือน้อยกว่า 10 ให้ตัวแดง
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record)}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="ลบข้อมูล"
            description="ต้องการลบยานี้หรือไม่?"
            onConfirm={() => handleDelete(record.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title={
          <div
            style={{
              textAlign: "center",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#0683e9",
            }}
          >
            รายการยาในคลัง
          </div>
        }
        bordered={false}
        className="shadow-sm"
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          bordered
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="แก้ไขข้อมูลยา"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="บันทึก"
        cancelText="ยกเลิก"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item label="ชื่อยา" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          {/* ✅ เปลี่ยน Input เป็น Select ให้เลือกประเภทยาได้เลยตอนแก้ไข */}
          <Form.Item
            label="ประเภทยา"
            name="drugTypeId"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="เลือกประเภทยา"
              options={masterDrugs.map((d) => ({
                label: d.drugType,
                value: d.drugTypeId,
              }))}
            />
          </Form.Item>

          <Space style={{ display: "flex", width: "100%" }}>
            <Form.Item
              label="ขนาดบรรจุ"
              name="packagingSize"
              style={{ flex: 1 }}
            >
              <Input />
            </Form.Item>
            <Form.Item label="ราคา" name="price" style={{ flex: 1 }}>
              <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
            </Form.Item>
          </Space>

          <Form.Item label="จำนวนคงเหลือ" name="quantity">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
