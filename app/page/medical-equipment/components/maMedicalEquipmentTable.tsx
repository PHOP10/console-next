"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  message,
  Popconfirm,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import { MaMedicalEquipmentType } from "../../common/index";

export default function MaMedicalEquipmentTable() {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maMedicalEquipmentServices(intraAuth);
  const [data, setData] = useState<MaMedicalEquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MaMedicalEquipmentType | null>(
    null
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      const result = await intraAuthService.getMaMedicalEquipmentQuery();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [intraAuthService]);

  useEffect(() => {
    if (loading) fetchData();
  }, [loading, fetchData]);

  const handleEdit = (item: MaMedicalEquipmentType) => {
    setEditingItem(item);
    form.setFieldsValue({
      ...item,
      sentDate: dayjs(item.sentDate),
      receivedDate: item.receivedDate ? dayjs(item.receivedDate) : null,
      createdAt: dayjs(item.createdAt).format("DD/MM/YYYY HH:mm"),
      updatedAt: dayjs(item.updatedAt).format("DD/MM/YYYY HH:mm"),
    });
    setEditModalVisible(true);
  };

  const onEditFinish = async (values: any) => {
    if (!editingItem) return;

    try {
      // แปลงวันที่เป็น ISO string เพื่อใช้เปรียบเทียบ
      const sentDate = values.sentDate?.toISOString();
      const receivedDate = values.receivedDate
        ? values.receivedDate.toISOString()
        : null;

      // สร้าง payload โดยเปรียบเทียบเฉพาะ field ที่เปลี่ยนจากของเดิม
      const updatedFields: any = {};

      if (values.quantity !== editingItem.quantity) {
        updatedFields.quantity = values.quantity;
      }

      if (sentDate !== new Date(editingItem.sentDate).toISOString()) {
        updatedFields.sentDate = sentDate;
      }

      if (
        (receivedDate || "") !==
        (editingItem.receivedDate
          ? new Date(editingItem.receivedDate).toISOString()
          : "")
      ) {
        updatedFields.receivedDate = receivedDate;
      }

      if (values.note !== editingItem.note) {
        updatedFields.note = values.note;
      }

      // เช็ค array เทียบแบบง่าย (ถ้า length ไม่เท่ากัน หรือมีค่าไม่ตรงกัน)
      const originalEquipmentInfo = editingItem.equipmentInfo || [];
      const newEquipmentInfo = values.equipmentInfo || [];

      const equipmentChanged =
        originalEquipmentInfo.length !== newEquipmentInfo.length ||
        originalEquipmentInfo.some(
          (v: any, i: any) => v !== newEquipmentInfo[i]
        );

      if (equipmentChanged) {
        updatedFields.equipmentInfo = {
          set: newEquipmentInfo,
        };
      }

      // ถ้าไม่มีอะไรเปลี่ยน
      if (Object.keys(updatedFields).length === 0) {
        message.info("ไม่มีการเปลี่ยนแปลงข้อมูล");
        return;
      }

      // เพิ่ม ID สำหรับการ PATCH
      updatedFields.id = editingItem.id;

      // เรียก API
      await intraAuthService.updateMaMedicalEquipment(updatedFields);

      message.success("บันทึกการแก้ไขเรียบร้อย");
      setEditModalVisible(false);
      setEditingItem(null);
      setLoading(true);
    } catch (error) {
      console.error("อัปเดตข้อมูลไม่สำเร็จ:", error);
      message.error("ไม่สามารถอัปเดตข้อมูลได้");
    }
  };

  const columns: ColumnsType<MaMedicalEquipmentType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 45,
    },
    {
      title: "ข้อมูลเครื่องมือ",
      dataIndex: "equipmentInfo",
      key: "equipmentInfo",
      render: (equipmentInfo: string[]) => (
        <ul style={{ paddingLeft: 20 }}>
          {equipmentInfo.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "วันที่ส่ง",
      dataIndex: "sentDate",
      key: "sentDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "วันที่รับกลับ",
      dataIndex: "receivedDate",
      key: "receivedDate",
      render: (date: string | null) =>
        date ? dayjs(date).format("DD/MM/YYYY") : "-",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: "หมายเหตุเพิ่มเติม",
      dataIndex: "note",
      key: "note",
      render: (note: string | undefined) => note || "-",
    },
    {
      title: "การจัดการ",
      key: "action",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
            onConfirm={async () => {
              try {
                await intraAuthService.deleteMaMedicalEquipment(record.id);
                message.success("ลบข้อมูลสำเร็จ");
                setLoading(true);
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

          <Button size="small" onClick={() => handleEdit(record)}>
            แก้ไข
          </Button>

          <Popconfirm
            title="ยืนยันการอนุมัติ"
            description="คุณแน่ใจหรือไม่ว่าต้องการอนุมัติรายการนี้?"
            onConfirm={async () => {
              try {
                await intraAuthService.updateMaMedicalEquipment({
                  ...record,
                  status: "Approve", // อัปเดตเฉพาะสถานะ
                });
                message.success("อนุมัติรายการแล้ว");
                setLoading(true);
              } catch (error) {
                console.error("เกิดข้อผิดพลาดในการอนุมัติ:", error);
                message.error("ไม่สามารถอนุมัติได้");
              }
            }}
            okText="ใช่"
            cancelText="ยกเลิก"
          >
            <Button type="primary" size="small">
              อนุมัติ
            </Button>
          </Popconfirm>

          <Popconfirm
            title="ยืนยันการยกเลิก"
            description="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกรายการนี้?"
            onConfirm={async () => {
              try {
                await intraAuthService.updateMaMedicalEquipment({
                  ...record,
                  status: "Cancel", // อัปเดตเฉพาะสถานะ
                });
                message.success("ยกเลิกรายการแล้ว");
                setLoading(true);
              } catch (error) {
                console.error("เกิดข้อผิดพลาดในการยกเลิก:", error);
                message.error("ไม่สามารถยกเลิกรายการได้");
              }
            }}
            okText="ใช่"
            cancelText="ยกเลิก"
          >
            <Button danger size="small">
              ยกเลิก
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
        bordered
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="แก้ไขข้อมูล"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => form.submit()}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical" onFinish={onEditFinish}>
          <Form.Item
            label="รายการเครื่องมือ"
            name="equipmentInfo"
            rules={[{ required: true, message: "กรุณาระบุรายการเครื่องมือ" }]}
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="พิมพ์แล้ว Enter เพื่อเพิ่ม"
            >
              {/* ให้ผู้ใช้พิมพ์ได้เอง */}
            </Select>
          </Form.Item>

          <Form.Item
            label="จำนวน"
            name="quantity"
            rules={[{ required: true, message: "กรุณากรอกจำนวน" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="วันที่ส่ง"
            name="sentDate"
            rules={[{ required: true, message: "กรุณาเลือกวันที่ส่ง" }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="วันที่รับกลับ" name="receivedDate">
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="สถานะ" name="status">
            <Select disabled>
              <Select.Option value="Waitingapproval">รออนุมัติ</Select.Option>
              <Select.Option value="Approve">อนุมัติ</Select.Option>
              <Select.Option value="Cancel">ยกเลิก</Select.Option>
              <Select.Option value="pending">รอดำเนินการ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="ผู้บันทึก" name="createdBy">
            <Input disabled />
          </Form.Item>

          <Form.Item label="รหัสผู้บันทึก" name="createdById">
            <Input disabled />
          </Form.Item>

          <Form.Item label="วันที่สร้าง" name="createdAt">
            <Input disabled />
          </Form.Item>

          <Form.Item label="วันที่อัปเดตล่าสุด" name="updatedAt">
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
