"use client";

import {
  Card,
  Table,
  Button,
  Popconfirm,
  message,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { InfectiousWasteType } from "../../common/index";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/infectiouswaste.service";
import { useState } from "react";
import dayjs from "dayjs";

interface ThrowAwayWasteTableProps {
  data: InfectiousWasteType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ThrowAwayWasteTable({
  data,
  loading,
  setLoading,
}: ThrowAwayWasteTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<InfectiousWasteType | null>(null);
  const [form] = Form.useForm();

  const handleEdit = (record: InfectiousWasteType) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      discardedDate: dayjs(record.discardedDate),
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...editingRecord,
        ...values,
        discardedDate: values.discardedDate.toISOString(),
      };

      await intraAuthService.updateInfectiousWaste(payload);
      message.success("อัปเดตข้อมูลสำเร็จ");
      setIsModalOpen(false);
      setEditingRecord(null);
      setLoading(true);
    } catch (error) {
      console.error("Error updating record:", error);
      message.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  const columns: ColumnsType<InfectiousWasteType> = [
    {
      title: "ประเภทขยะ",
      dataIndex: "wasteType",
      key: "wasteType",
    },
    {
      title: "น้ำหนัก (กิโลกรัม)",
      dataIndex: "wasteWeight",
      key: "wasteWeight",
    },
    {
      title: "วันที่ส่งกำจัด",
      dataIndex: "discardedDate",
      key: "discardedDate",
      render: (date: string) => new Date(date).toLocaleDateString("th-TH"),
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
                await intraAuthService.deleteInfectiousWaste(record.id);
                message.success("ลบข้อมูลสำเร็จ");
                setLoading(true);
              } catch (error) {
                console.error("Error deleting waste:", error);
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
            size="small"
            type="primary"
            onClick={() => handleEdit(record)}
          >
            แก้ไข
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal สำหรับแก้ไข */}
      <Modal
        title="แก้ไขข้อมูลขยะติดเชื้อ"
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="wasteType"
            label="ประเภทขยะ"
            rules={[{ required: true, message: "กรุณากรอกประเภทขยะ" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="wasteWeight"
            label="น้ำหนัก (กิโลกรัม)"
            rules={[{ required: true, message: "กรุณากรอกน้ำหนัก" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="discardedDate"
            label="วันที่ส่งกำจัด"
            rules={[{ required: true, message: "กรุณาเลือกวันที่" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
