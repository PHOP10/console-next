"use client";

import React, { useState } from "react";
import {
  Button,
  message,
  Popconfirm,
  Space,
  Table,
  Modal,
  Form,
  Input,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { VisitHomeType } from "../../common";
import { visitHomeServices } from "../services/visitHome.service";

interface VisitHomeTableProps {
  data: VisitHomeType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function VisitHomeTable({
  data,
  loading,
  setLoading,
}: VisitHomeTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = visitHomeServices(intraAuth);

  const [editingRecord, setEditingRecord] = useState<VisitHomeType | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const openEditModal = (record: VisitHomeType) => {
    setEditingRecord(record);
    setModalVisible(true);

    form.setFieldsValue({
      ...record,
      visitDate: record.visitDate ? dayjs(record.visitDate) : null,
      nextAppointment: record.nextAppointment
        ? dayjs(record.nextAppointment)
        : null,
    });
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

      if (!editingRecord) {
        message.error("ไม่พบข้อมูลที่จะแก้ไข");
        return;
      }

      const payload = {
        ...values,
        id: editingRecord.id,
        age: Number(values.age),
        visitDate: values.visitDate ? values.visitDate.toISOString() : null,
        nextAppointment: values.nextAppointment
          ? values.nextAppointment.toISOString()
          : null,
        symptoms: values.symptoms || null,
        medication: values.medication || null,
        notes: values.notes || null,
      };

      const res = await intraAuthService.updateVisitHome(payload);

      if (res) {
        message.success("แก้ไขข้อมูลสำเร็จ");
        setModalVisible(false);
        setEditingRecord(null);
        setLoading(true);
      } else {
        message.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการแก้ไข:", error);
      message.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
  };

  const columns = [
    { title: "ชื่อ", dataIndex: "firstName", key: "firstName" },
    { title: "นามสกุล", dataIndex: "lastName", key: "lastName" },
    { title: "อายุ", dataIndex: "age", key: "age" },
    { title: "ที่อยู่", dataIndex: "address", key: "address" },
    {
      title: "วันที่เยี่ยมบ้าน",
      dataIndex: "visitDate",
      key: "visitDate",
      render: (value: string) =>
        value ? dayjs(value).format("DD-MM-YYYY") : "-",
    },
    { title: "อาการ", dataIndex: "symptoms", key: "symptoms" },
    { title: "การใช้ยา", dataIndex: "medication", key: "medication" },
    {
      title: "นัดครั้งถัดไป",
      dataIndex: "nextAppointment",
      key: "nextAppointment",
      render: (value: string) =>
        value ? dayjs(value).format("DD-MM-YYYY") : "-",
    },
    { title: "หมายเหตุ", dataIndex: "notes", key: "notes" },
    {
      title: "จัดการ",
      key: "action",
      render: (_: any, record: VisitHomeType) => (
        <Space>
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
            onConfirm={async () => {
              try {
                await intraAuthService.deleteVisitHome(record.id);
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
          <Button size="small" onClick={() => openEditModal(record)}>
            แก้ไข
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title="แก้ไขข้อมูลการเยี่ยมบ้าน"
        visible={modalVisible}
        onOk={handleUpdate}
        onCancel={() => {
          setModalVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="ชื่อ"
            name="firstName"
            rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="นามสกุล"
            name="lastName"
            rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="อายุ"
            name="age"
            rules={[{ required: true, message: "กรุณากรอกอายุ" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="ที่อยู่"
            name="address"
            rules={[{ required: true, message: "กรุณากรอกที่อยู่" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="วันที่เยี่ยมบ้าน"
            name="visitDate"
            rules={[{ required: true, message: "กรุณาเลือกวันที่เยี่ยมบ้าน" }]}
          >
            <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="นัดครั้งถัดไป" name="nextAppointment">
            <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="อาการ" name="symptoms">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="การใช้ยา" name="medication">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="หมายเหตุ" name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
