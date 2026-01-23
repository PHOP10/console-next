"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Card,
  Modal,
  Form,
  Input,
  InputNumber,
  Select, // ✅ เพิ่ม Select
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
import { DrugType, MasterDrugType } from "../../common"; // ✅ import MasterDrugType
import CustomTable from "../../common/CustomTable";

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

  // ✅ โหลดข้อมูล MasterDrug เมื่อ Component เริ่มทำงาน
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

  // --- Functions ---
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await intraAuthService.deleteMaDrug(id);
      message.success("ลบข้อมูลสำเร็จ");
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      message.error("ลบข้อมูลไม่สำเร็จ");
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

  // --- Columns ---
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
      title: "ประเภทยา", // ✅ เปลี่ยนหัวข้อ
      dataIndex: "drugTypeId",
      key: "drugTypeId",
      align: "center",
      width: 150,
      // ✅ ใช้ render เพื่อเทียบ ID กับ list masterDrugs
      render: (id) => {
        // หา object ใน masterDrugs ที่มี drugTypeId ตรงกับ id ของแถวนี้
        const match = masterDrugs.find(
          (m) => m.drugTypeId === id || m.id === id,
        );
        return match ? (
          <Tag color="blue">{match.drugType}</Tag> // เจอ: แสดงชื่อ (ใส่ Tag สวยๆ)
        ) : (
          <span style={{ color: "gray" }}>{id}</span> // ไม่เจอ: แสดง ID เดิมไปก่อน
        );
      },
    },
    {
      title: "ขนาดบรรจุ",
      dataIndex: "packagingSize",
      key: "packagingSize",
      align: "center",
    },
    {
      title: "ราคา/หน่วย",
      dataIndex: "price",
      key: "price",
      align: "center",
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
      render: (value) => (
        <span
          style={{
            color: value <= 10 ? "red" : "inherit",
            fontWeight: value <= 10 ? "bold" : "normal",
          }}
        >
          {Number(value).toLocaleString()}
        </span>
      ), // เพิ่มลูกเล่น ถ้าเหลือน้อยกว่า 10 ให้ตัวแดง
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          {/* ส่วนแก้ไข */}
          <Tooltip title="แก้ไข">
            <EditOutlined
              style={{
                fontSize: 22,
                color: "#faad14", // สีส้ม (หรือใช้ #1677ff สีฟ้าก็ได้)
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onClick={() => handleEditClick(record)}
            />
          </Tooltip>

          {/* ส่วนลบ */}
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
                  fontSize: 22,
                  color: "#ff4d4f", // สีแดง Danger
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

  const packingOptions = [
    { value: "10's" },
    { value: "50's" },
    { value: "100's" },
    { value: "500's" },
    { value: "1000's" },
    { value: "แผง" },
    { value: "กล่อง" },
    { value: "ขวด" },
    { value: "กระปุก" },
    { value: "ซอง" },
    { value: "ถุง" },
    { value: "ห่อ" },
    { value: "แพ็ค" },
    { value: "ชิ้น" },
    { value: "คู่" },
    { value: "ชุด" },
    { value: "ม้วน" },
    { value: "หลอด" },
    { value: "Vial" },
    { value: "Amp" },
    { value: "5 g." },
    { value: "10 g." },
    { value: "lb." },
  ];

  return (
    <>
      <Card
        title={
          <div
            style={{
              textAlign: "center",
              fontSize: "24px",
              fontWeight: "bold",
              color: "#0683e9",
            }}
          >
            รายการยาในคลัง
          </div>
        }
        bordered={false}
        className="shadow-sm"
      >
        <CustomTable
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          bordered
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="✏️ แก้ไขข้อมูลยา"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="บันทึกการแก้ไข"
        cancelText="ยกเลิก"
        destroyOnClose
        width={700} // เพิ่มความกว้าง Modal นิดหน่อยเพื่อให้จัด Layout สวย
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          style={{ marginTop: 16 }}
        >
          {/* แถวที่ 1: รหัสยา และ ประเภทยา */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Working Code (รหัสยา)"
                name="workingCode"
                rules={[{ required: true, message: "กรุณาระบุรหัสยา" }]}
              >
                <Input placeholder="เช่น W-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="ประเภทยา"
                name="drugTypeId"
                rules={[{ required: true, message: "กรุณาเลือกประเภทยา" }]}
              >
                <Select
                  placeholder="เลือกประเภทยา"
                  options={masterDrugs.map((d) => ({
                    label: d.drugType,
                    value: d.drugTypeId, // ✅ ใช้ drugTypeId ตามที่แก้ไปก่อนหน้า
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
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="ขนาดบรรจุ"
                name="packagingSize"
                rules={[{ required: true, message: "ระบุขนาด" }]}
              >
                <AutoComplete
                  options={packingOptions}
                  placeholder="เช่น แผง/กล่อง"
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
                label="ราคาต่อหน่วย"
                name="price"
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={0.01}
                  formatter={(value) =>
                    `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value: any) =>
                    value?.replace(/\฿\s?|(,*)/g, "") || ""
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="จำนวนคงเหลือ"
                name="quantity"
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
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
