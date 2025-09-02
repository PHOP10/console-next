"use client";

import React, { useState, useEffect } from "react";
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
  Select,
} from "antd";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { VisitHomeType, MasterPatientType } from "../../common";
import { visitHomeServices } from "../services/visitHome.service";

import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

interface VisitHomeTableProps {
  data: VisitHomeType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  masterPatients: MasterPatientType[];
}

export default function VisitHomeTable({
  data,
  loading,
  setLoading,
  masterPatients,
}: VisitHomeTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = visitHomeServices(intraAuth);

  const [editingRecord, setEditingRecord] = useState<VisitHomeType | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // search state
  const [searchText, setSearchText] = useState("");
  const [filterPatientType, setFilterPatientType] = useState<number | null>(
    null
  );

  // Filtered data
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.address?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.symptoms?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.medication?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchText.toLowerCase());

    const matchesPatientType = filterPatientType
      ? item.patientType?.id === filterPatientType
      : true;

    return matchesSearch && matchesPatientType;
  });

  const openEditModal = (record: VisitHomeType) => {
    setEditingRecord(record);
    setModalVisible(true);

    form.setFieldsValue({
      ...record,
      visitDate: record.visitDate ? dayjs(record.visitDate) : null,
      nextAppointment: record.nextAppointment
        ? dayjs(record.nextAppointment)
        : null,
      patientTypeId: record.patientType?.id || null,
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
        patientTypeId: values.patientTypeId || null,
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
      title: "ประเภทผู้ป่วย",
      dataIndex: "patientType",
      key: "patientType",
      render: (value: any) => value?.typeName || "-",
    },
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
          <Button
            type="primary"
            size="small"
            onClick={() => openEditModal(record)}
          >
            แก้ไข
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* ช่องค้นหาข้อมูล ขวาสุด พร้อมไอคอน */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Input
          placeholder="ค้นหาข้อมูล..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
          allowClear
          prefix={<SearchOutlined />}
        />
      </div>

      {/* ตารางข้อมูล พร้อม Pagination */}
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }} // แสดง 5 รายการต่อหน้า
      />

      {/* Modal แก้ไขข้อมูล */}
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
          <Form.Item
            label="ประเภทผู้ป่วย"
            name="patientTypeId"
            rules={[{ required: true, message: "กรุณาเลือกประเภทผู้ป่วย" }]}
          >
            <Select placeholder="เลือกประเภทผู้ป่วย" style={{ width: "100%" }}>
              {(masterPatients || []).map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.typeName}
                </Option>
              ))}
            </Select>
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
