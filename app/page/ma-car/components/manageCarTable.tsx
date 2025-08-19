"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Card,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import { MasterCarType } from "../../common";

interface ManageCarTableProps {
  dataCar: MasterCarType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ManageCarPage({
  dataCar,
  loading,
  setLoading,
}: ManageCarTableProps) {
  const [data, setData] = useState<MasterCarType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await intraAuthService.getMasterCarQuery();
      setData(res);
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถดึงข้อมูลรถได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ฟังก์ชันเพิ่มรถ
  const onFinish = async (values: any) => {
    try {
      await intraAuthService.createMasterCar(values);
      message.success("เพิ่มรถสำเร็จ");
      form.resetFields();
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("เพิ่มรถไม่สำเร็จ");
    }
  };

  // ฟังก์ชันลบรถ
  const handleDelete = async (id: number) => {
    try {
      await intraAuthService.deleteMasterCar(id);
      message.success("ลบรถสำเร็จ");
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("ลบรถไม่สำเร็จ");
    }
  };

  const columns: ColumnsType<MasterCarType> = [
    { title: "ชื่อรถ", dataIndex: "carName", key: "carName" },
    { title: "ทะเบียนรถ", dataIndex: "licensePlate", key: "licensePlate" },
    { title: "ยี่ห้อ", dataIndex: "brand", key: "brand" },
    { title: "รุ่น", dataIndex: "model", key: "model" },
    { title: "ปี", dataIndex: "year", key: "year" },
    { title: "สถานะ", dataIndex: "status", key: "status" },
    { title: "รายละเอียด", dataIndex: "details", key: "details" },
    {
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="ยืนยันการลบ"
          description="คุณแน่ใจหรือไม่ว่าต้องการลบรถคันนี้?"
          okText="ใช่"
          cancelText="ไม่"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button danger>ลบ</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card>
      <Button
        type="primary"
        onClick={() => {
          form.resetFields();
          setIsModalOpen(true);
        }}
        style={{ marginBottom: 16 }}
      >
        เพิ่มรถ
      </Button>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="เพิ่มรถใหม่"
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="carName"
            label="ชื่อรถ"
            rules={[{ required: true, message: "กรุณากรอกชื่อรถ" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="licensePlate"
            label="ทะเบียนรถ"
            rules={[{ required: true, message: "กรุณากรอกทะเบียนรถ" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="brand"
            label="ยี่ห้อ"
            rules={[{ required: true, message: "กรุณากรอกยี่ห้อรถ" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="model"
            label="รุ่น"
            rules={[{ required: true, message: "กรุณากรอกรุ่นรถ" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="year"
            label="ปี"
            rules={[{ required: true, message: "กรุณากรอกปีรถ" }]}
          >
            <InputNumber min={1900} max={2100} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="status" label="สถานะ" initialValue="available">
            <Select>
              <Select.Option value="available">ใช้งานได้ปกติ</Select.Option>
              <Select.Option value="unavailable">
                ไม่สามารถใช้งานได้
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="details" label="รายละเอียดเพิ่มเติม">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              บันทึก
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
