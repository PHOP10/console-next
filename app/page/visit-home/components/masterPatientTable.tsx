"use client";

import React, { useState } from "react";
import {
  Button,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Tooltip,
  Space,
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MasterPatientType } from "../../common";
import { visitHomeServices } from "../services/visitHome.service";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import CustomTable from "../../common/CustomTable";

interface MasterPatientTableProps {
  dataMasterPatient: MasterPatientType[];
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setDataMasterPatient: React.Dispatch<
    React.SetStateAction<MasterPatientType[]>
  >;
}

export default function MasterPatientTable({
  dataMasterPatient,
  setLoading,
  setDataMasterPatient,
}: MasterPatientTableProps) {
  const intraAuth = useAxiosAuth();
  const service = visitHomeServices(intraAuth);

  // State สำหรับเปิดปิด Modal
  const [modalOpen, setModalOpen] = useState(false);
  // State สำหรับเก็บข้อมูลที่กำลังแก้ไข
  const [editingRecord, setEditingRecord] = useState<MasterPatientType | null>(
    null,
  );

  const [form] = Form.useForm();
  const [msgApi, contextHolder] = message.useMessage();

  // ฟังก์ชันลบข้อมูล (Logic เดิม)
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await service.deleteMasterPatient(id);
      setDataMasterPatient((prev = []) =>
        prev.filter((item) => item.id !== id),
      );
      msgApi.success("ลบข้อมูลสำเร็จ");
    } catch (err) {
      msgApi.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันเปิด Modal เพื่อแก้ไข (Logic เดิม)
  const handleEdit = (record: MasterPatientType) => {
    setEditingRecord(record);
    form.setFieldsValue({
      typeName: record.typeName,
      description: record.description,
    });
    setModalOpen(true);
  };

  // ฟังก์ชันปิด Modal (Logic เดิม)
  const handleCancel = () => {
    setModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  // ฟังก์ชันบันทึกข้อมูล (Logic เดิม)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingRecord) {
        const payload = {
          ...values,
          id: editingRecord.id,
        };

        const updatedData = await service.updateMasterPatient(payload);

        if (updatedData) {
          setDataMasterPatient((prev) =>
            prev.map((item) =>
              item.id === editingRecord.id ? { ...item, ...values } : item,
            ),
          );
          msgApi.success("แก้ไขข้อมูลสำเร็จ");
        } else {
          throw new Error("Update failed");
        }
      } else {
        const newPatient = await service.createMasterPatient(values);
        setDataMasterPatient((prev) => [...prev, newPatient]);
        msgApi.success("เพิ่มประเภทผู้ป่วยสำเร็จ");
      }

      handleCancel();
    } catch (err) {
      console.error(err);
      msgApi.error(
        editingRecord
          ? "ไม่สามารถแก้ไขข้อมูลได้"
          : "ไม่สามารถเพิ่มประเภทผู้ป่วยได้",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ปรับ Header ให้ Responsive */}
      <div className="mb-4 sm:mb-6 -mt-4 sm:-mt-7">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0683e9] text-center mb-2 tracking-tight">
          ประเภทผู้ป่วย
        </h2>
        <hr className="border-slate-100/20 -mx-4 sm:-mx-6" />
      </div>

      {contextHolder}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          // ปรับปุ่มให้เต็มจอบนมือถือ
          className="w-full sm:w-auto h-10 rounded-lg shadow-sm"
          onClick={() => {
            setEditingRecord(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          + เพิ่มประเภทผู้ป่วย
        </Button>
      </div>

      <CustomTable
        rowKey="id"
        dataSource={dataMasterPatient}
        loading={false}
        pagination={{ pageSize: 10 }}
        bordered
        // เพิ่ม Scroll แนวนอน เพื่อรองรับมือถือ
        scroll={{ x: "max-content" }}
        columns={[
          {
            title: "ลำดับ",
            key: "index",
            align: "center",
            width: 60,
            render: (_: any, __: any, index: number) => index + 1,
          },
          {
            title: "ประเภทผู้ป่วย",
            dataIndex: "typeName",
            key: "typeName",
            align: "center",
            width: 150,
          },
          {
            title: "รายละเอียด",
            dataIndex: "description",
            key: "description",
            align: "center",
            width: 200,
            // เพิ่ม truncate เพื่อไม่ให้ตารางยืดเกินไปในมือถือ
            render: (text) => (
              <div className="truncate max-w-[200px] mx-auto font-normal">
                {text || "-"}
              </div>
            ),
          },
          {
            title: "จัดการ",
            key: "action",
            align: "center",
            width: 100,
            render: (_: any, record: MasterPatientType) => (
              <Space size="small">
              
                <Tooltip title="แก้ไข">
                  <EditOutlined
                    style={{
                      fontSize: 18, // 2. ปรับขนาดเป็น 18px
                      color: "#faad14",
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                    onClick={() => handleEdit(record)}
                  />
                </Tooltip>

                <Popconfirm
                  title="ยืนยันการลบ"
                  onConfirm={() => handleDelete(record.id)}
                  okText="ใช่"
                  cancelText="ยกเลิก"
                >
                  <Tooltip title="ลบ">
                    <DeleteOutlined
                      style={{
                        fontSize: 18, // 2. ปรับขนาดเป็น 18px
                        color: "#ff4d4f",
                        cursor: "pointer",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#cf1322")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#ff4d4f")
                      }
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editingRecord ? "แก้ไขประเภทผู้ป่วย" : "เพิ่มประเภทผู้ป่วย"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="บันทึก"
        cancelText="ยกเลิก"
        centered
        // ปรับ Modal ให้ Responsive ไม่ล้นจอ
        width={500}
        style={{ maxWidth: "95%", top: 20 }}
        styles={{
          content: { borderRadius: "16px", padding: "20px" },
        }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="ประเภทผู้ป่วย"
            name="typeName"
            rules={[{ required: true, message: "กรุณากรอกประเภทผู้ป่วย" }]}
          >
            <Input
              placeholder="เช่น ผู้ป่วยทั่วไป, ผู้ป่วยฉุกเฉิน"
              className="rounded-lg h-10"
            />
          </Form.Item>
          <Form.Item label="รายละเอียด" name="description">
            <Input.TextArea
              placeholder="คำอธิบายเพิ่มเติม (ถ้ามี)"
              rows={3}
              className="rounded-lg"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
