"use client";

import {
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Popconfirm,
  InputNumber,
  Card,
  Tooltip,
} from "antd";
import React, { useRef, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import { MedicalEquipmentType } from "../../common/index";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import th_TH from "antd/es/date-picker/locale/th_TH";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import CustomTable from "../../common/CustomTable";
import { buddhistLocale } from "@/app/common";

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  dataEQ: MedicalEquipmentType[];
  fetchData: () => void;
};

export default function EquipmentTable({
  setLoading,
  loading,
  dataEQ,
  fetchData,
}: Props) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maMedicalEquipmentServices(intraAuth);
  const intraAuthServiceRef = useRef(intraAuthService);
  const { data: session } = useSession();
  intraAuthServiceRef.current = intraAuthService;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState<MedicalEquipmentType | null>(
    null,
  );

  const handleCreate = async (values: any) => {
    const payload = {
      ...values,
      createdBy: session?.user?.fullName,
      createdById: session?.user?.userId,
      acquiredDate: values.acquiredDate.toISOString(),
    };

    try {
      await intraAuthService.createMedicalEquipment(payload);
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
      title: "ลำดับ",
      key: "index",
      align: "center",
      width: 60,
      responsive: ["md"], // ซ่อนบนมือถือ
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "ชื่อเครื่องมือ",
      dataIndex: "equipmentName",
      key: "equipmentName",
      align: "center",
      width: 150,
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 80,
    },
    {
      title: "วันที่ได้รับ",
      dataIndex: "acquiredDate",
      key: "acquiredDate",
      align: "center",
      width: 120,
      render: (date: string) => {
        if (!date) return "-";
        const dateObj = dayjs(date);
        return (
          <>
            {/* แสดงบนมือถือ: D MMM BB */}
            <span className="md:hidden font-normal">
              {dateObj.format("D MMM BB")}
            </span>
            {/* แสดงบนจอใหญ่: D MMMM BBBB */}
            <span className="hidden md:block font-normal">
              {dateObj.format("D MMMM BBBB")}
            </span>
          </>
        );
      },
    },
    {
      title: "ผู้เพิ่มข้อมูล",
      dataIndex: "createdBy",
      key: "createdBy",
      align: "center",
      width: 120,
      responsive: ["lg"],
    },
    {
      title: "รายละเอียด",
      dataIndex: "description",
      key: "description",
      align: "center",
      width: 150,
      responsive: ["xl"],
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 100,
      // ไม่ใช้ fixed ตามข้อ 5
      render: (_, record) => (
        <Space size="small">
          {/* ส่วนแก้ไข */}
          <Tooltip title="แก้ไข">
            <EditOutlined
              onClick={() => handleEdit(record)}
              style={{
                fontSize: 18, // ปรับขนาดเป็น 18px ตามข้อ 3
                color: "#faad14",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
            />
          </Tooltip>

          {/* ส่วนลบ */}
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
            <Tooltip title="ลบ">
              <DeleteOutlined
                style={{
                  fontSize: 18, // ปรับขนาดเป็น 18px ตามข้อ 3
                  color: "#ff4d4f",
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
              />
            </Tooltip>
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
              fontSize: "clamp(18px, 4vw, 24px)",
              fontWeight: "bold",
              color: "#0683e9",
            }}
          >
            รายการเครื่องมือแพทย์ทั้งหมด
          </div>
        }
        bordered={true}
        style={{ width: "100%" }}
      >
        <Space
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            + เพิ่มเครื่องมือแพทย์
          </Button>
        </Space>

        <CustomTable
          columns={columns}
          dataSource={dataEQ}
          rowKey="id"
          loading={loading}
          bordered
          // ใช้ size small บนมือถือ
          size="small"
          pagination={{ pageSize: 10, size: "small" }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <Modal
        title={
          <div className="text-xl font-bold text-[#0683e9] text-center w-full">
            {editingItem ? "แก้ไขเครื่องมือแพทย์" : "เพิ่มเครื่องมือแพทย์"}
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingItem(null);
        }}
        onOk={() => form.submit()}
        okText="บันทึก"
        cancelText="ยกเลิก"
        centered
        // ปรับ Modal ให้ Responsive
        width={500}
        style={{ maxWidth: "95%" }}
        styles={{
          content: { borderRadius: "20px", padding: "30px" },
          header: { marginBottom: "20px" },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingItem ? handleSubmit : handleCreate}
        >
          <Form.Item
            label="ชื่อเครื่องมือ"
            name="equipmentName"
            rules={[{ required: true, message: "กรุณากรอกชื่อเครื่องมือ" }]}
          >
            <Input
              placeholder="ระบุชื่อเครื่องมือ"
              className="w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300"
            />
          </Form.Item>

          <Form.Item
            label="จำนวนเครื่องมือ"
            name="quantity"
            rules={[{ required: true, message: "กรุณากรอกจำนวนเครื่องมือ" }]}
          >
            <InputNumber
              placeholder="0"
              min={1}
              className="w-full h-11 rounded-xl border-gray-300 shadow-sm pt-1 hover:border-blue-400 focus:border-blue-500 focus:shadow-md transition-all duration-300"
            />
          </Form.Item>

          <Form.Item
            label="วันที่ได้รับ"
            name="acquiredDate"
            rules={[{ required: true, message: "กรุณาเลือกวันที่ได้รับ" }]}
          >
            <DatePicker
              locale={buddhistLocale}
              format="D MMMM BBBB"
              placeholder="เลือกวันที่"
              className="w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:shadow-md transition-all duration-300"
            />
          </Form.Item>

          <Form.Item label="รายละเอียดเพิ่มเติม" name="description">
            <Input.TextArea
              rows={3}
              placeholder="รายละเอียดอื่นๆ (ถ้ามี)"
              className="rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
