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
  Card,
  Tooltip,
} from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ColumnsType } from "antd/es/table";
// import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import { MedicalEquipmentType } from "../../common/index";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";
import th_TH from "antd/es/date-picker/locale/th_TH";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import CustomTable from "../../common/CustomTable";

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
    // console.log(payload);

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
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "ชื่อเครื่องมือ",
      dataIndex: "equipmentName",
      key: "equipmentName",
      align: "center",
    },
    {
      title: "จำนวนเครื่องมือ",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "วันที่ได้รับ",
      dataIndex: "acquiredDate",
      key: "acquiredDate",
      align: "center",
      render: (date: string) => {
        if (!date) return "-";
        return dayjs(date).format("D MMMM BBBB");
      },
    },
    {
      title: "ผู้เพิ่มข้อมมูล",
      dataIndex: "createdBy",
      key: "createdBy",
      align: "center",
    },
    {
      title: "รายละเอียดเพิ่มเติม",
      dataIndex: "description",
      key: "description",
      align: "center",
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          {/* ส่วนแก้ไข (ดินสอสีส้ม) */}
          <Tooltip title="แก้ไข">
            <EditOutlined
              onClick={() => handleEdit(record)}
              style={{
                fontSize: 20,
                color: "#faad14", // สีส้ม (ตามโค้ดเดิม)
                cursor: "pointer",
                transition: "color 0.2s",
              }}
            />
          </Tooltip>

          {/* ส่วนลบ (ถังขยะสีแดง) */}
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
                  fontSize: 20,
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
              fontSize: "20px",
              textAlign: "center",
              fontWeight: "bold",
              color: "#0683e9",
            }}
          >
            ข้อมูลเครื่องมือแพทย์ทั้งหมด
          </div>
        }
        bordered={true}
        style={{ width: "100%" }}
      >
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            เพิ่มเครื่องมือแพทย์
          </Button>
        </Space>

        <CustomTable
          columns={columns}
          dataSource={dataEQ}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        // 1. ปรับหัวข้อเป็นสีฟ้า ตัวหนา จัดกึ่งกลาง
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
        centered // จัดให้อยู่กลางจอเสมอ
        // 2. ปรับตัว Modal ให้โค้งมนและโปร่งขึ้น
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
          {/* 3. Input: ชื่อเครื่องมือ */}
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

          {/* 4. InputNumber: จำนวน */}
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

          {/* 5. DatePicker: วันที่ */}
          <Form.Item
            label="วันที่ได้รับ"
            name="acquiredDate"
            rules={[{ required: true, message: "กรุณาเลือกวันที่ได้รับ" }]}
          >
            <DatePicker
              locale={th_TH}
              format="D MMMM BBBB"
              placeholder="เลือกวันที่"
              className="w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:shadow-md transition-all duration-300"
            />
          </Form.Item>

          {/* 6. TextArea: รายละเอียด (ไม่ fix ความสูง แต่ใส่ style ขอบมน) */}
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
