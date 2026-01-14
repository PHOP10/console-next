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
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
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
        wasteWeight: parseFloat(values.wasteWeight),
      };

      await intraAuthService.updateInfectiousWaste(payload);
      message.success("แก้ไขข้อมูลสำเร็จ");
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
      align: "center",
    },
    {
      title: "น้ำหนัก (กิโลกรัม)",
      dataIndex: "wasteWeight",
      key: "wasteWeight",
      align: "center",
    },
    {
      title: "วันที่ส่งกำจัด",
      dataIndex: "discardedDate",
      key: "discardedDate",
      render: (date: string) => {
        if (!date) return "-";
        return dayjs(date).format("D MMMM BBBB");
      },
      align: "center",
    },
    {
      title: "ผู้ส่งกำจัด",
      dataIndex: "createdName",
      key: "createdName",
      align: "center",
    },
    {
      title: "การจัดการ",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          {session?.user.role === "admin" && (
            <>
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
                type="primary"
                size="small"
                onClick={() => handleEdit(record)}
                style={{
                  marginRight: 8,
                  backgroundColor: "#faad14", // สีเหลือง
                  borderColor: "#faad14", // เส้นกรอบเป็นสีเดียวกัน
                  color: "#ffffff", // ตัวอักษรสีขาว
                }}
              >
                แก้ไข
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
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
          ข้อมูลขยะติดเชื้อ
        </div>
      }
    >
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
        bordered
      />

      {/* Modal สำหรับแก้ไข */}
      <Modal
        title="แก้ไขข้อมูลขยะติดเชื้อ"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        centered
        footer={[
          <div style={{ width: "100%", textAlign: "center" }} key="footer">
            <Button onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
            <Button
              type="primary"
              onClick={handleUpdate}
              style={{ marginLeft: 8 }}
            >
              บันทึก
            </Button>
          </div>,
        ]}
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
            label="น้ำหนักขยะติดเชื้อ (กิโลกรัม)"
            name="wasteWeight"
            rules={[
              { required: true, message: "กรุณาระบุน้ำหนักขยะ" },
              {
                pattern: /^\d+(\.\d{1,2})?$/,
                message: "กรุณากรอกตัวเลข เช่น 1.25",
              },
            ]}
          >
            <Input placeholder="เช่น 1.25" />
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
