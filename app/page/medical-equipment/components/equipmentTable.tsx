"use client";

import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Popconfirm,
  InputNumber,
} from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";

import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import { MedicalEquipmentType } from "../../common/index";

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
};

export default function EquipmentTable({ setLoading, loading }: Props) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maMedicalEquipmentServices(intraAuth);
  const intraAuthServiceRef = useRef(intraAuthService);
  intraAuthServiceRef.current = intraAuthService;
  const [data, setData] = useState<MedicalEquipmentType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState<MedicalEquipmentType | null>(
    null
  );

  // ดึงข้อมูล
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result =
        await intraAuthServiceRef.current.getMedicalEquipmentQuery();
      setData(result || []);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
      message.error("ไม่สามารถดึงข้อมูลได้");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading]); // เหลือแค่ setLoading

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // เพิ่มข้อมูล
  const handleCreate = async (values: any) => {
    try {
      await intraAuthService.createMedicalEquipment({
        ...values,
        acquiredDate: values.acquiredDate.toISOString(),
      });
      message.success("เพิ่มข้อมูลสำเร็จ");
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    }
  };

  const handleEdit = (record: MedicalEquipmentType) => {
    setEditingItem(record);
    setIsModalOpen(true);
    form.setFieldsValue({
      ...record,
      acquiredDate: dayjs(record.acquiredDate),
    });
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      acquiredDate: values.acquiredDate.toISOString(),
    };

    try {
      if (editingItem) {
        await intraAuthService.updateMedicalEquipment({
          id: editingItem.id,
          ...payload,
        });
        message.success("แก้ไขข้อมูลสำเร็จ");
      } else {
        await intraAuthService.createMedicalEquipment(payload);
        message.success("เพิ่มข้อมูลสำเร็จ");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingItem(null);
      fetchData();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  // คอลัมน์ของตาราง
  const columns: ColumnsType<MedicalEquipmentType> = [
    {
      title: "รหัสเครื่องมือ",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "ชื่อเครื่องมือ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "จำนวนเครื่องมือ",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "วันที่ได้รับ",
      dataIndex: "acquiredDate",
      key: "acquiredDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "รายละเอียดเพิ่มเติม",
      dataIndex: "description",
      key: "description",
    },
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
                await intraAuthService.deleteMedicalEquipment(record.id);
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
          <Button type="link" onClick={() => handleEdit(record)}>
            แก้ไข
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          เพิ่มเครื่องมือแพทย์
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        bordered
      />

      <Modal
        title="เพิ่มเครื่องมือแพทย์"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="รหัสเครื่องมือ"
            name="code"
            rules={[{ required: true, message: "กรุณากรอกรหัสเครื่องมือ" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="ชื่อเครื่องมือ"
            name="name"
            rules={[{ required: true, message: "กรุณากรอกชื่อเครื่องมือ" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="จำนวนเครื่องมือ"
            name="quantity"
            rules={[{ required: true, message: "กรุณากรอกจำนวนเครื่องมือ" }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>

          <Form.Item
            label="วันที่ได้รับ"
            name="acquiredDate"
            rules={[{ required: true, message: "กรุณาเลือกวันที่ได้รับ" }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="รายละเอียดเพิ่มเติม" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingItem ? "แก้ไขเครื่องมือแพทย์" : "เพิ่มเครื่องมือแพทย์"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingItem(null);
        }}
        onOk={() => form.submit()}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="รหัสเครื่องมือ"
            name="code"
            rules={[{ required: true, message: "กรุณากรอกรหัสเครื่องมือ" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="ชื่อเครื่องมือ"
            name="name"
            rules={[{ required: true, message: "กรุณากรอกชื่อเครื่องมือ" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="จำนวนเครื่องมือ"
            name="quantity"
            rules={[{ required: true, message: "กรุณากรอกจำนวนเครื่องมือ" }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>

          <Form.Item
            label="วันที่ได้รับ"
            name="acquiredDate"
            rules={[{ required: true, message: "กรุณาเลือกวันที่ได้รับ" }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="รายละเอียดเพิ่มเติม" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
