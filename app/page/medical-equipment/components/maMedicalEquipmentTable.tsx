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
  Popover,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import { MaMedicalEquipmentType } from "../../common/index";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import MedicalEquipmentTableDetails from "./medicalEquipmentTableDetails";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedRecord, setSelectedRecord] =
    useState<MaMedicalEquipmentType | null>(null);
  const [formCancel] = Form.useForm();
  const { data: session } = useSession();
  const [openDetails, setOpenDetails] = useState(false);
  const [recordDetails, setRecordDetails] = useState<any>(null);

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
      const sentDate = values.sentDate?.toISOString();
      const receivedDate = values.receivedDate
        ? values.receivedDate.toISOString()
        : null;
      const updatedFields: any = {};

      // if (values.quantity !== editingItem.quantity) {
      //   updatedFields.quantity = values.quantity;
      // }

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
      // const originalEquipmentInfo = editingItem.equipmentInfo || [];
      const newEquipmentInfo = values.equipmentInfo || [];

      // const equipmentChanged =
      //   originalEquipmentInfo.length !== newEquipmentInfo.length ||
      //   originalEquipmentInfo.some(
      //     (v: any, i: any) => v !== newEquipmentInfo[i]
      //   );

      // if (equipmentChanged) {
      //   updatedFields.equipmentInfo = {
      //     set: newEquipmentInfo,
      //   };
      // }
      if (Object.keys(updatedFields).length === 0) {
        message.info("ไม่มีการเปลี่ยนแปลงข้อมูล");
        return;
      }
      updatedFields.id = editingItem.id;
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

  const handleCancel = async (values: any) => {
    if (!selectedRecord) return;
    try {
      await intraAuthService.updateMaMedicalEquipment({
        id: selectedRecord.id,
        status: "cancel",
        cancelReason: values.cancelReason,
        nameReason: session?.user?.fullName,
      });

      message.success("ยกเลิกรายการแล้ว");
      setIsModalOpen(false);
      setCancelReason("");
      setSelectedRecord(null);
      setLoading(true);
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      message.error("ไม่สามารถยกเลิกรายการได้");
    }
  };

  const handleOpenModalDetails = (record: any) => {
    setRecordDetails(record);
    setOpenDetails(true);
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
      dataIndex: "items",
      key: "items",
      width: 200,
      render: (items: any[]) => (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {items?.map((item, index) => (
            <li key={index}>{item.medicalEquipment?.equipmentName}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "จำนวน",
      dataIndex: "items",
      key: "items",
      width: 160,
      render: (items: any[]) => (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {items?.map((item, index) => (
            <li key={index}>{item.quantity}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "วันที่ส่ง",
      dataIndex: "sentDate",
      key: "sentDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "ผู้ส่ง",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = "";

        switch (status) {
          case "pending":
            color = "blue";
            text = "รอดำเนินการ";
            break;
          case "approve":
            color = "green";
            text = "อนุมัติ";
            break;
          case "cancel":
            color = "red";
            text = "ยกเลิก";
            break;
          case "return":
            color = "grey";
            text = "รับคืนแล้ว";
            break;
          default:
            text = status;
        }

        return <Tag color={color}>{text}</Tag>;
      },
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

          <Button
            type="primary"
            size="small"
            onClick={() => handleEdit(record)}
            disabled={record.status !== "pending"}
          >
            แก้ไข
          </Button>
          <Popover
            trigger="click"
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                <Typography.Text strong>ยืนยันการอนุมัติ ?</Typography.Text>
              </Space>
            }
            content={
              <Space style={{ display: "flex", marginTop: 13 }}>
                <Button
                  type="primary"
                  size="small"
                  onClick={async () => {
                    try {
                      await intraAuthService.updateMaMedicalEquipment({
                        id: record.id,
                        status: "approve",
                        approveById: session?.user?.userId,
                        approveBy: session?.user?.fullName,
                      });
                      message.success("อนุมัติรายการแล้ว");
                      setLoading(true);
                    } catch (error) {
                      console.error("เกิดข้อผิดพลาดในการอนุมัติ:", error);
                      message.error("ไม่สามารถอนุมัติได้");
                    }
                  }}
                >
                  อนุมัติ
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() => {
                    setSelectedRecord(record);
                    setIsModalOpen(true);
                  }}
                >
                  ยกเลิก
                </Button>
              </Space>
            }
          >
            <Button
              type="primary"
              size="small"
              disabled={record.status !== "pending"}
            >
              อนุมัติ
            </Button>
          </Popover>
          <Button
            type="default"
            size="small"
            onClick={() => handleOpenModalDetails(record)}
          >
            รายละเอียด
          </Button>
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
            ></Select>
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

      <Modal
        title="กรอกเหตุผลการยกเลิกรายการนี้"
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
          formCancel.resetFields();
        }}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => handleCancel(values)}
        >
          <Form.Item
            name="cancelReason"
            rules={[{ required: true, message: "กรุณาระบุเหตุผลการยกเลิก" }]}
          >
            <Input.TextArea rows={3} placeholder="ระบุเหตุผลการยกเลิก" />
          </Form.Item>
        </Form>
      </Modal>
      <MedicalEquipmentTableDetails
        record={recordDetails}
        open={openDetails}
        onClose={() => setOpenDetails(false)}
      />
    </>
  );
}
