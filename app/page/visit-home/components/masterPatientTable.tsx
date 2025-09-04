"use client";

import React, { useState } from "react";
import { Table, Button, Popconfirm, message, Modal, Form, Input } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MasterPatientType } from "../../common";
import { visitHomeServices } from "../services/visitHome.service";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [msgApi, contextHolder] = message.useMessage();

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await service.deleteMasterPatient(id);
      setDataMasterPatient((prev = []) =>
        prev.filter((item) => item.id !== id)
      );
      msgApi.success("ลบข้อมูลสำเร็จ");
    } catch (err) {
      msgApi.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const newPatient = await service.createMasterPatient(values);
      setDataMasterPatient((prev) => [...prev, newPatient]);
      msgApi.success("เพิ่มประเภทผู้ป่วยสำเร็จ");
      form.resetFields();
      setModalOpen(false);
    } catch (err) {
      msgApi.error("ไม่สามารถเพิ่มประเภทผู้ป่วยได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 20,
          marginBottom: 16,
          borderRadius: "8px",
        }}
      >
        จัดการประเภทผู้ป่วย
      </div>

      {contextHolder}
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => setModalOpen(true)}
      >
        + เพิ่มประเภทผู้ป่วย
      </Button>

      <Table
        rowKey="id"
        dataSource={dataMasterPatient}
        loading={false}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: "ลำดับ", dataIndex: "id", key: "id", align: "center" },
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
              <Popconfirm
                title="ยืนยันการลบ"
                onConfirm={() => handleDelete(record.id)}
                okText="ใช่"
                cancelText="ยกเลิก"
              >
                <Button danger size="small">
                  ลบ
                </Button>
              </Popconfirm>
            ),
          },
        ]}
      />

      <Modal
        title="เพิ่มประเภทผู้ป่วย"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
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
