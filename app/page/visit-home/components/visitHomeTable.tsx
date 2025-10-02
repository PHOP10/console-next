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

import * as XLSX from "xlsx";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

interface VisitHomeTableProps {
  data: VisitHomeType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  masterPatients: MasterPatientType[];
  fetchData: () => Promise<void>;
}

export default function VisitHomeTable({
  data,
  loading,
  setLoading,
  masterPatients,
  fetchData,
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
    const search = searchText.toLowerCase();

    const matchesSearch =
      item.firstName?.toLowerCase().includes(search) ||
      item.lastName?.toLowerCase().includes(search) ||
      item.address?.toLowerCase().includes(search) ||
      item.symptoms?.toLowerCase().includes(search) ||
      item.medication?.toLowerCase().includes(search) ||
      item.notes?.toLowerCase().includes(search) ||
      (item.age !== undefined && item.age.toString().includes(search));

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

  const handleDelete = async (id: number) => {
    try {
      await intraAuthService.deleteVisitHome(id);
      message.success("ลบผู้ใช้สำเร็จ");
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถลบผู้ใช้ได้");
    }
  };

  const columns: ColumnsType<VisitHomeType> = [
    {
      title: "ชื่อ",
      dataIndex: "firstName",
      key: "firstName",
      align: "center",
    },
    {
      title: "นามสกุล",
      dataIndex: "lastName",
      key: "lastName",
      align: "center",
    },
    { title: "อายุ", dataIndex: "age", key: "age", align: "center" },
    { title: "ที่อยู่", dataIndex: "address", key: "address", align: "center" },
    {
      title: "วันที่เยี่ยมบ้าน",
      dataIndex: "visitDate",
      key: "visitDate",
      align: "center",
      render: (value: string) =>
        value ? dayjs(value).format("DD-MM-YYYY") : "-",
    },
    { title: "อาการ", dataIndex: "symptoms", key: "symptoms", align: "center" },
    {
      title: "การใช้ยา",
      dataIndex: "medication",
      key: "medication",
      align: "center",
    },
    {
      title: "ประเภทผู้ป่วย",
      dataIndex: "patientType",
      key: "patientType",
      align: "center",
      render: (value: any) => value?.typeName || "-",
    },
    {
      title: "นัดครั้งถัดไป",
      dataIndex: "nextAppointment",
      key: "nextAppointment",
      align: "center",
      render: (value: string) =>
        value ? dayjs(value).format("DD-MM-YYYY") : "-",
    },
    { title: "หมายเหตุ", dataIndex: "notes", key: "notes", align: "center" },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?"
            onConfirm={() => handleDelete(record.id)}
            okText="ใช่"
            cancelText="ยกเลิก"
          >
            <Button
              type="default"
              size="small"
              style={{
                color: "#ff4d4f", // ตัวอักษรสีแดง
                borderColor: "#ff4d4f", // กรอบสีแดง
                backgroundColor: "#ffffff", // พื้นหลังขาว
              }}
            >
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* ช่องค้นหาข้อมูล ขวาสุด พร้อมไอคอน */}
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 20,
          marginBottom: 16,
          borderRadius: "8px",
          color: "#1890ff",
        }}
      >
        ข้อมูลการเยี่ยมบ้าน
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between", // ช่องค้นหาซ้าย ปุ่มขวา
          alignItems: "center",
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

        {/* <Button
          type="primary"
          onClick={() => {
            // สร้าง worksheet จากข้อมูล
            const worksheet = XLSX.utils.json_to_sheet(filteredData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "VisitHome");

            // ดาวน์โหลดไฟล์
            XLSX.writeFile(workbook, "VisitHomeData.xlsx");
          }}
        >
          Export Excel
        </Button> */}
      </div>

      {/* ตารางข้อมูล พร้อม Pagination */}
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
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
            style={{ textAlign: "center" }}
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
