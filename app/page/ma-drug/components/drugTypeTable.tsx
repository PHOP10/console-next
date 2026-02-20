"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Modal,
  Card,
  Tooltip,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import type { MasterDrugType } from "../../common";
import CustomTable from "../../common/CustomTable";

export default function DrugTypeTable() {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  const [data, setData] = useState<MasterDrugType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MasterDrugType | null>(
    null,
  );
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await intraAuthService.getMasterDrugQuery();
      const drugData = Array.isArray(result)
        ? result
        : Array.isArray((result as any)?.data)
          ? (result as any).data
          : [];
      setData(drugData);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("ไม่สามารถดึงข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: MasterDrugType) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      setSubmitLoading(true);
      const payload = {
        ...values,
        drugTypeId: Number(values.drugTypeId),
      };

      if (editingRecord) {
        await intraAuthService.updateMasterDrug({
          ...payload,
          id: editingRecord.id,
        });
        message.success("แก้ไขข้อมูลสำเร็จ");
      } else {
        await intraAuthService.createMasterDrug(payload);
        message.success("เพิ่มข้อมูลสำเร็จ");
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      console.error("Save error:", error);
      const errorMsg =
        error?.response?.data?.message || "บันทึกข้อมูลไม่สำเร็จ";
      message.error(errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await intraAuthService.deleteMasterDrug(id);
      message.success("ลบข้อมูลสำเร็จ");
      fetchData();
    } catch (error: any) {
      console.error("Delete error:", error);

      // ✅ ดึงข้อความจาก Backend มาแสดง
      const errorMsg = error?.response?.data?.message;

      if (errorMsg) {
        message.error(errorMsg);
      } else {
        // ถ้าไม่มีข้อความ (Error อื่นๆ) ให้แสดงข้อความกลางๆ
        message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  const columns: ColumnsType<MasterDrugType> = [
    {
      title: "รหัสประเภท",
      dataIndex: "drugTypeId",
      key: "drugTypeId",
      align: "center",
      width: 100,
    },
    {
      title: "ชื่อประเภทยา",
      dataIndex: "drugType",
      key: "drugType",
      align: "center",
      width: 150,
    },
    {
      title: "คำอธิบาย",
      dataIndex: "description",
      key: "description",
      align: "center",
      width: 200,
      responsive: ["md"],
      render: (text) => text || "-",
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="แก้ไข">
            <EditOutlined
              style={{
                fontSize: 18,
                color: "#faad14",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onClick={() => handleOpenEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="ยืนยันการลบ"
            onConfirm={() => handleDelete(record.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="ลบ">
              <DeleteOutlined
                style={{
                  fontSize: 18,
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
    <Card
      bordered={false}
      className="shadow-sm"
      bodyStyle={{ padding: "16px sm:24px" }}
      title={
        <div
          style={{
            color: "#0683e9",
            textAlign: "center",
            fontSize: "clamp(18px, 4vw, 24px)",
            fontWeight: "bold",
            marginTop: "10px",
            marginBottom: "8px",
          }}
        >
          จัดการประเภทยา
        </div>
      }
    >
      {/* ปุ่มเพิ่ม (ชิดขวา) */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "16px",
        }}
      >
        <Button
          type="primary"
          onClick={handleOpenAdd}
          className="w-full sm:w-auto h-10 rounded-lg shadow-sm"
        >
          + เพิ่มประเภทยา
        </Button>
      </div>

      <CustomTable
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        pagination={{ pageSize: 10, size: "small" }}
        size="small"
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={
          <div className="text-lg sm:text-xl font-bold text-[#0683e9] text-center w-full">
            {editingRecord ? (
              <span>
              
                แก้ไขประเภทยา
              </span>
            ) : (
              <span>เพิ่มประเภทยาใหม่</span>
            )}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitLoading}
        okText="บันทึก"
        cancelText="ยกเลิก"
        destroyOnClose
        centered
        width={500}
        style={{ maxWidth: "95%", top: 20 }}
        styles={{
          content: { borderRadius: "16px", padding: "20px" },
          header: { marginBottom: "16px" },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          preserve={false}
        >
          <Form.Item
            label="รหัสประเภทยา"
            name="drugTypeId"
            rules={[
              { required: true, message: "กรุณากรอกรหัสประเภทยา" },

              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || editingRecord) {
                    return Promise.resolve();
                  }
                  const exists = data.some(
                    (item) => item.drugTypeId === Number(value),
                  );
                  if (exists) {
                    return Promise.reject(
                      new Error("รหัสประเภทนี้มีอยู่แล้วในระบบ"),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input
              type="number"
              placeholder="กรอกรหัสประเภทยา"
              className="w-full h-10 rounded-lg border-gray-300 shadow-sm"
              disabled={!!editingRecord}
            />
          </Form.Item>

          <Form.Item
            label="ชื่อประเภทยา"
            name="drugType"
            rules={[{ required: true, message: "กรุณากรอกชื่อประเภทยา" }]}
          >
            <Input
              placeholder="กรอกชื่อประเภทยา"
              className="w-full h-10 rounded-lg border-gray-300 shadow-sm"
            />
          </Form.Item>

          <Form.Item label="คำอธิบายเพิ่มเติม" name="description">
            <Input.TextArea
              rows={3}
              placeholder="กรอกรายละเอียด (ถ้ามี)"
              className="w-full rounded-lg border-gray-300 shadow-sm"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
