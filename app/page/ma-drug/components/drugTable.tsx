"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Space,
  Popconfirm,
  message,
  Card,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  AutoComplete,
  Row,
  Col,
  Tooltip,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType, MasterDrugType } from "../../common";
import CustomTable from "../../common/CustomTable";
import { packingOptions } from "../../../common/index";

interface DrugTableProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  data: DrugType[];
  setData: React.Dispatch<React.SetStateAction<DrugType[]>>;
}

export default function DrugTable({
  setLoading,
  loading,
  data,
  setData,
}: DrugTableProps) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DrugType | null>(null);
  const [form] = Form.useForm();
  const [masterDrugs, setMasterDrugs] = useState<MasterDrugType[]>([]);

  useEffect(() => {
    const fetchMasterDrugs = async () => {
      try {
        const res: MasterDrugType[] =
          await intraAuthService.getMasterDrugQuery();
        if (Array.isArray(res)) {
          setMasterDrugs(res);
        }
      } catch (error) {
        console.error("Failed to load master drugs", error);
      }
    };
    fetchMasterDrugs();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await intraAuthService.deleteDrugItem(id);
      message.success("ลบข้อมูลสำเร็จ");
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error("Delete Error:", error);
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || "";
      if (
        status === 400 ||
        status === 409 ||
        errorMessage.includes("foreign key") ||
        errorMessage.includes("constraint")
      ) {
        Modal.warning({
          title: "ไม่สามารถลบข้อมูลได้",
          content: (
            <div>
              <p>
                รายการยานี้มีการใช้งานอยู่ในระบบ (เช่น มีประวัติการเบิก/จ่าย
                หรือรับเข้า)
              </p>
              <p className="text-gray-500 text-xs mt-2">
                เพื่อความถูกต้องของข้อมูลสต็อก ไม่สามารถลบได้
              </p>
            </div>
          ),
          okText: "เข้าใจแล้ว",
        });
      } else {
        message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record: DrugType) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleUpdate = async (values: any) => {
    if (!editingRecord) return;
    try {
      setLoading(true);
      const payload = {
        ...editingRecord,
        ...values,
        id: editingRecord.id,
      };

      const updatedData = await intraAuthService.updateDrug(payload);
      message.success("แก้ไขข้อมูลสำเร็จ");

      setData((prev) =>
        prev.map((item) => (item.id === editingRecord.id ? updatedData : item)),
      );

      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error(error);
      message.error("แก้ไขข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<DrugType> = [
    {
      title: "รหัสยา",
      dataIndex: "workingCode",
      key: "workingCode",
      align: "center",
      width: 100,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "ชื่อยา",
      dataIndex: "name",
      key: "name",
      align: "center",
      width: 200,
    },
    {
      title: "ประเภทยา",
      dataIndex: "drugTypeId",
      key: "drugTypeId",
      align: "center",
      width: 150,
      responsive: ["md"], // ซ่อนบนมือถือ
      render: (id) => {
        const match = masterDrugs.find(
          (m) => m.drugTypeId === id || m.id === id,
        );
        return match ? (
          <Tag color="blue">{match.drugType}</Tag>
        ) : (
          <span style={{ color: "gray" }}>{id}</span>
        );
      },
    },
    {
      title: "ขนาดบรรจุ",
      dataIndex: "packagingSize",
      key: "packagingSize",
      align: "center",
      width: 100,
      responsive: ["sm"], // ซ่อนบนมือถือเล็กมาก
    },
    {
      title: "ราคา/หน่วย",
      dataIndex: "price",
      key: "price",
      align: "center",
      width: 100,
      responsive: ["sm"], // ซ่อนบนมือถือเล็กมาก
      render: (value) =>
        Number(value).toLocaleString("th-TH", {
          style: "currency",
          currency: "THB",
        }),
    },
    {
      title: "คงเหลือ",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 80,
      render: (value) => (
        <span
          style={{
            color: value <= 10 ? "red" : "inherit",
            fontWeight: value <= 10 ? "bold" : "normal",
          }}
        >
          {Number(value).toLocaleString()}
        </span>
      ),
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="แก้ไข">
            <EditOutlined
              style={{
                fontSize: 18, // ขนาด 18px
                color: "#faad14",
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onClick={() => handleEditClick(record)}
            />
          </Tooltip>

          <Popconfirm
            title="ลบข้อมูล"
            description="ต้องการลบยานี้หรือไม่?"
            onConfirm={() => handleDelete(record.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="ลบ">
              <DeleteOutlined
                style={{
                  fontSize: 18, // ขนาด 18px
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
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-[#0683e9] text-center mb-2 tracking-tight">
          รายการยาในคลัง
        </h2>
        <hr className="border-slate-100/30 -mx-6 md:-mx-6" />
      </div>

      <Card bordered={false} className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <CustomTable
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          bordered
          size="small" // ใช้ size small บนมือถือ
          pagination={{ pageSize: 10, size: "small" }}
          scroll={{ x: "max-content" }} // เพิ่ม scroll แนวนอน
        />
      </Card>

      <Modal
        title={
          <div className="text-lg sm:text-xl font-bold text-[#0683e9] text-center w-full">
            แก้ไขข้อมูลยา
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="บันทึก"
        cancelText="ยกเลิก"
        destroyOnClose
        centered
        width={700}
        // Responsive Modal
        style={{ maxWidth: "95%", top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          style={{ marginTop: 16 }}
        >
          {/* แถวที่ 1: รหัสยา และ ประเภทยา */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Working Code (รหัสยา)"
                name="workingCode"
                rules={[{ required: true, message: "กรุณาระบุรหัสยา" }]}
              >
                <Input placeholder="เช่น W-001" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="ประเภทยา"
                name="drugTypeId"
                rules={[{ required: true, message: "กรุณาเลือกประเภทยา" }]}
              >
                <Select
                  placeholder="เลือกประเภทยา"
                  options={masterDrugs.map((d) => ({
                    label: d.drugType,
                    value: d.drugTypeId,
                  }))}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* แถวที่ 2: ชื่อยา (ยาวเต็มบรรทัด) */}
          <Form.Item
            label="ชื่อยา"
            name="name"
            rules={[{ required: true, message: "กรุณาระบุชื่อยา" }]}
          >
            <Input placeholder="ระบุชื่อยา" />
          </Form.Item>

          {/* แถวที่ 3: ขนาดบรรจุ, ราคา, คงเหลือ (แบ่ง 3 ส่วนเท่ากัน) */}
          <Row gutter={[12, 12]}>
            {" "}
            {/* ลด gutter ลงนิดหน่อย */}
            <Col span={8}>
              {" "}
              {/* span 8 = 1/3 ของ 24 */}
              <Form.Item
                label="ขนาดบรรจุ"
                name="packagingSize"
                rules={[{ required: true, message: "ระบุขนาด" }]}
              >
                <AutoComplete
                  options={packingOptions}
                  placeholder="หน่วย"
                  filterOption={(inputValue, option) =>
                    option!.value
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="ราคา/หน่วย"
                name="price"
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="คงเหลือ"
                name="quantity"
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* แถวสุดท้าย: หมายเหตุ */}
          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea
              rows={2}
              placeholder="ระบุข้อมูลเพิ่มเติม (ถ้ามี)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
