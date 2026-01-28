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
import { DeleteOutlined, EditOutlined } from "@ant-design/icons"; // เพิ่ม Icon แก้ไข
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
  // State สำหรับเก็บข้อมูลที่กำลังแก้ไข (ถ้าเป็น null คือโหมดเพิ่มใหม่)
  const [editingRecord, setEditingRecord] = useState<MasterPatientType | null>(
    null,
  );

  const [form] = Form.useForm();
  const [msgApi, contextHolder] = message.useMessage();

  // ฟังก์ชันลบข้อมูล
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

  // ฟังก์ชันเปิด Modal เพื่อแก้ไข
  const handleEdit = (record: MasterPatientType) => {
    setEditingRecord(record); // เก็บข้อมูลที่กำลังแก้
    form.setFieldsValue({
      // นำข้อมูลเดิมไปใส่ใน Form
      typeName: record.typeName,
      description: record.description,
    });
    setModalOpen(true); // เปิด Modal
  };

  // ฟังก์ชันปิด Modal และล้างค่า
  const handleCancel = () => {
    setModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  // ฟังก์ชันบันทึกข้อมูล (ใช้ร่วมกันทั้ง เพิ่ม และ แก้ไข)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingRecord) {
        // --- กรณีแก้ไขข้อมูล ---
        const payload = {
          ...values,
          id: editingRecord.id, // ต้องส่ง id ไปด้วยตาม service ที่ให้มา
        };

        const updatedData = await service.updateMasterPatient(payload);

        if (updatedData) {
          // อัปเดตข้อมูลในตารางโดยไม่ต้องโหลดใหม่
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
        // --- กรณีเพิ่มข้อมูลใหม่ ---
        const newPatient = await service.createMasterPatient(values);
        setDataMasterPatient((prev) => [...prev, newPatient]);
        msgApi.success("เพิ่มประเภทผู้ป่วยสำเร็จ");
      }

      handleCancel(); // ปิด Modal และล้างค่า
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
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-[#0683e9] text-center mb-2 tracking-tight">
          ประเภทผู้ป่วย
        </h2>
        <hr className="border-slate-100/20 -mx-6 md:-mx-6" />
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
        columns={[
          {
            title: "ลำดับ",
            key: "index", // เปลี่ยน key ไม่ให้ซ้ำกับ id
            align: "center",
            width: 80, // (แนะนำ) กำหนดความกว้างให้ดูสวยงาม
            render: (_: any, __: any, index: number) => index + 1, // ใช้ index (เริ่มที่ 0) บวก 1
          },
          {
            title: "ประเภทผู้ป่วย",
            dataIndex: "typeName",
            key: "typeName",
            align: "center",
          },
          {
            title: "รายละเอียด",
            dataIndex: "description",
            key: "description",
            align: "center",
            render: (text) => text || "-",
          },
          {
            title: "จัดการ",
            key: "action",
            align: "center",
            render: (_: any, record: MasterPatientType) => (
              <Space size="middle">
                {/* ปุ่มแก้ไข */}
                <Tooltip title="แก้ไข">
                  <EditOutlined
                    style={{
                      fontSize: 22,
                      color: "#faad14", // สีส้มสำหรับการแก้ไข
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                    onClick={() => handleEdit(record)}
                  />
                </Tooltip>

                {/* ปุ่มลบ */}
                <Popconfirm
                  title="ยืนยันการลบ"
                  onConfirm={() => handleDelete(record.id)}
                  okText="ใช่"
                  cancelText="ยกเลิก"
                >
                  <Tooltip title="ลบ">
                    <DeleteOutlined
                      style={{
                        fontSize: 22,
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
        // เปลี่ยนชื่อหัวข้อตามสถานะ
        title={editingRecord ? "แก้ไขประเภทผู้ป่วย" : "เพิ่มประเภทผู้ป่วย"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="ประเภทผู้ป่วย"
            name="typeName"
            rules={[{ required: true, message: "กรุณากรอกประเภทผู้ป่วย" }]}
          >
            <Input placeholder="เช่น ผู้ป่วยทั่วไป, ผู้ป่วยฉุกเฉิน" />
          </Form.Item>
          <Form.Item label="รายละเอียด" name="description">
            <Input.TextArea placeholder="คำอธิบายเพิ่มเติม (ถ้ามี)" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
