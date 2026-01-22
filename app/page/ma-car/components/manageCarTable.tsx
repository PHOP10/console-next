"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Card,
  Popconfirm,
  Space,
  Row,
  Col,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import { MasterCarType } from "../../common";
import { DeleteOutlined, FormOutlined } from "@ant-design/icons";

interface ManageCarTableProps {
  dataCar: MasterCarType[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ManageCarPage({
  dataCar,
  loading,
  setLoading,
}: ManageCarTableProps) {
  const [data, setData] = useState<MasterCarType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<MasterCarType | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await intraAuthService.getMasterCarQuery();
      setData(res);
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถดึงข้อมูลรถได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ฟังก์ชันเพิ่มรถ
  const onFinish = async (values: any) => {
    try {
      const { carName, licensePlate, numberType } = values;
      const isDuplicate = data.some(
        (car: any) =>
          car.licensePlate === licensePlate || car.carName === carName
      );
      if (isDuplicate) {
        const duplicateCar = data.find(
          (car: any) => car.licensePlate === licensePlate
        );
        const msg = duplicateCar
          ? `ทะเบียนรถ "${licensePlate}" มีอยู่ในระบบแล้ว`
          : `ชื่อรถ "${carName}" มีอยู่ในระบบแล้ว`;

        return message.warning(msg);
      }

      const payload = {
        ...values,
        status: values.status || "available",
      };

      await intraAuthService.createMasterCar(payload);

      message.success("เพิ่มรถสำเร็จ");
      form.resetFields();
      setIsModalOpen(false);
      fetchData(); // ดึงข้อมูลใหม่เพื่อให้อัปเดต dataCars ครั้งต่อไป
    } catch (err: any) {
      console.error(err);
      // ดัก Error เผื่อกรณีมีการเพิ่มจากเครื่องอื่นพร้อมกัน (Race Condition)
      if (err.response?.status === 409) {
        message.error("ข้อมูลนี้ถูกเพิ่มโดยผู้ใช้อื่นไปก่อนหน้าแล้ว");
      } else {
        message.error("เพิ่มรถไม่สำเร็จ");
      }
    }
  };

  // ฟังก์ชันแก้ไขรถ
  const onEditFinish = async (values: any) => {
    if (!editingCar) return;
    try {
      const payload = {
        ...editingCar,
        ...values,
      };
      await intraAuthService.updateMasterCar(payload);
      message.success("แก้ไขรถสำเร็จ");
      setIsEditModalOpen(false);
      setEditingCar(null);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("แก้ไขรถไม่สำเร็จ");
    }
  };

  // ฟังก์ชันลบรถ
  const handleDelete = async (id: number) => {
    try {
      await intraAuthService.deleteMasterCar(id);
      message.success("ลบรถสำเร็จ");
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("ลบรถไม่สำเร็จ");
    }
  };

  const columns: ColumnsType<MasterCarType> = [
    { title: "ชื่อรถ", dataIndex: "carName", key: "carName", align: "center" },
    { title: "ทะเบียนรถ", dataIndex: "licensePlate", key: "licensePlate", align: "center" },
    { title: "ยี่ห้อ", dataIndex: "brand", key: "brand", align: "center" },
    { title: "รุ่น", dataIndex: "model", key: "model", align: "center" },
    // { title: "ปี", dataIndex: "year", key: "year" },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) =>
        status === "available" ? "พร้อมใช้งาน" : "ไม่พร้อมใช้งาน",
    },
    // { title: "รายละเอียด", dataIndex: "details", key: "details" },
    {
      title: "รายละเอียด",
      dataIndex: "details",
      key: "details",
      align: "center",
      ellipsis: true,
      render: (text: string) => {
        const maxLength = 15;
        if (!text) return "-";
        return text.length > maxLength ? (
          <Tooltip placement="topLeft" title={text}>
            {text.slice(0, maxLength) + "..."}
          </Tooltip>
        ) : (
          text
        );
      },
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="แก้ไข">
            <FormOutlined
              style={{
                fontSize: 20,
                color: "#faad14",
                cursor: "pointer",
              }}
              onClick={() => {
                setEditingCar(record);
                editForm.setFieldsValue(record);
                setIsEditModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="ลบข้อมูล">
            <Popconfirm
              title="ยืนยันการลบ"
              description="คุณแน่ใจหรือไม่ว่าต้องการลบรถคันนี้?"
              okText="ใช่"
              cancelText="ไม่"
              onConfirm={() => handleDelete(record.id)}
              okButtonProps={{ danger: true }} // ทำให้ปุ่ม "ใช่" ใน Popconfirm เป็นสีแดงด้วย
            >
              <DeleteOutlined
                style={{
                  fontSize: 20, // ขนาดไอคอน (ใกล้เคียงกับไอคอนแก้ไขที่คุณใช้)
                  color: "#ff4d4f", // สีแดงของ Ant Design
                  cursor: "pointer",
                  marginLeft: 12, // ระยะห่างจากไอคอนแก้ไข
                }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

return (
    <>
      <div
        style={{
          textAlign: "center",
          fontSize: "20px",
          fontWeight: "bold",
          color: "#0683e9",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "12px",
          marginBottom: "24px",
          marginTop: "-12px",  
          marginLeft: "-24px", 
          marginRight: "-24px",
        }}
      >
        ข้อมูลรถทั้งหมด
      </div>

      {/* 2. ปุ่มเพิ่มรถ */}
      <div style={{ display: "flex", justifyContent: "flex-start" }}> 
        <Button
          type="primary"
          onClick={() => {
            form.resetFields();
            setIsModalOpen(true);
          }}
          style={{ marginBottom: 16 }}
        >
         + เพิ่มรถ
        </Button>
      </div>

      {/* 3. ตาราง */}
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        bordered
      />

      {/* ------------------ Modal เพิ่มรถ ------------------ */}
      <Modal
        title="เพิ่มรถใหม่"
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="carName"
                label="ชื่อรถ"
                rules={[
                  { required: true, message: "กรุณากรอกชื่อรถ" },
                  {
                    validator: (_, value) => {
                      if (data.some((car) => car.carName === value)) {
                        return Promise.reject(
                          new Error("ชื่อรถนี้มีในระบบแล้ว")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="เช่น รถตู้ส่วนกลาง" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="numberType"
                label="หมายเลขรถ"
                rules={[
                  { required: true, message: "กรุณากรอกหมายเลขรถ" },
                  {
                    validator: (_, value) => {
                      if (data.some((car) => car.numberType === value)) {
                        return Promise.reject(
                          new Error("หมายเลขรถนี้มีในระบบแล้ว")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="หมายเลขลำดับรถ"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="licensePlate"
                label="ทะเบียนรถ"
                rules={[
                  { required: true, message: "กรุณากรอกทะเบียนรถ" },
                  {
                    validator: (_, value) => {
                      if (data.some((car) => car.licensePlate === value)) {
                        return Promise.reject(
                          new Error("ทะเบียนรถนี้มีในระบบแล้ว")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="brand"
                label="ยี่ห้อ"
                rules={[{ required: true, message: "กรุณากรอกยี่ห้อรถ" }]}
              >
                <Input placeholder="เช่น Toyota" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="model"
                label="รุ่น"
                rules={[{ required: true, message: "กรุณากรอกรุ่นรถ" }]}
              >
                <Input placeholder="เช่น Commuter" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fuelType"
                label="ประเภทน้ำมัน"
                rules={[{ required: true, message: "กรุณาเลือกประเภทน้ำมัน" }]}
              >
                <Select placeholder="เลือกประเภทน้ำมัน">
                  <Select.Option value="ดีเซล">ดีเซล</Select.Option>
                  <Select.Option value="เบนซิน 95">เบนซิน 95</Select.Option>
                  <Select.Option value="แก๊สโซฮอล์ 91">
                    แก๊สโซฮอล์ 91
                  </Select.Option>
                  <Select.Option value="ไฟฟ้า">ไฟฟ้า (EV)</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="status"
                label="สถานะการใช้งาน"
                initialValue="available"
              >
                <Select>
                  <Select.Option value="available">พร้อมใช้งาน</Select.Option>
                  <Select.Option value="unavailable">
                    ไม่พร้อมใช้งาน (ซ่อม/งดใช้)
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="details" label="รายละเอียดเพิ่มเติม">
            <Input.TextArea
              rows={3}
              placeholder="ระบุข้อมูลอื่นๆ เช่น สีรถ, ประกันภัย"
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => setIsModalOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button type="primary" htmlType="submit">
              บันทึกข้อมูล
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* ------------------ Modal แก้ไขรถ ------------------ */}
      <Modal
        title="แก้ไขรถ"
        open={isEditModalOpen}
        footer={null}
        onCancel={() => setIsEditModalOpen(false)}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={onEditFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="carName"
                label="ชื่อรถ"
                rules={[
                  { required: true, message: "กรุณากรอกชื่อรถ" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();

                      const isDuplicate = data.some(
                        (car) =>
                          car.carName === value && car.id !== editingCar?.id
                      );

                      if (isDuplicate) {
                        return Promise.reject(
                          new Error("ชื่อรถนี้มีในระบบแล้ว")
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="เช่น รถตู้ส่วนกลาง" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="numberType"
                label="หมายเลขรถ"
                rules={[
                  { required: true, message: "กรุณากรอกหมายเลขรถ" },
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null)
                        return Promise.resolve();
                      const isDuplicate = data.some(
                        (car) =>
                          car.numberType === value && car.id !== editingCar?.id
                      );
                      if (isDuplicate) {
                        return Promise.reject(
                          new Error("หมายเลขรถนี้มีในระบบแล้ว")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="หมายเลขลำดับรถ"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="licensePlate"
                label="ทะเบียนรถ"
                rules={[
                  { required: true, message: "กรุณากรอกทะเบียนรถ" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const isDuplicate = data.some(
                        (car) =>
                          car.licensePlate === value &&
                          car.id !== editingCar?.id
                      );
                      if (isDuplicate) {
                        return Promise.reject(
                          new Error("ทะเบียนรถนี้มีในระบบแล้ว")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="เช่น กข 1234 ตาก" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="brand"
                label="ยี่ห้อ"
                rules={[{ required: true, message: "กรุณากรอกยี่ห้อรถ" }]}
              >
                <Input placeholder="เช่น Toyota" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="model"
                label="รุ่น"
                rules={[{ required: true, message: "กรุณากรอกรุ่นรถ" }]}
              >
                <Input placeholder="เช่น Commuter" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fuelType"
                label="ประเภทน้ำมัน"
                rules={[{ required: true, message: "กรุณาเลือกประเภทน้ำมัน" }]}
              >
                <Select placeholder="เลือกประเภทน้ำมัน">
                  <Select.Option value="ดีเซล">ดีเซล</Select.Option>
                  <Select.Option value="เบนซิน 95">เบนซิน 95</Select.Option>
                  <Select.Option value="แก๊สโซฮอล์ 91">
                    แก๊สโซฮอล์ 91
                  </Select.Option>
                  <Select.Option value="ไฟฟ้า">ไฟฟ้า (EV)</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="status"
                label="สถานะการใช้งาน"
                initialValue="available"
              >
                <Select>
                  <Select.Option value="available">พร้อมใช้งาน</Select.Option>
                  <Select.Option value="unavailable">
                    ไม่พร้อมใช้งาน (ซ่อม/งดใช้)
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="details" label="รายละเอียดเพิ่มเติม">
            <Input.TextArea
              rows={3}
              placeholder="ระบุข้อมูลอื่นๆ เช่น สีรถ, ประกันภัย"
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "center", marginTop: "24px" }}>
            <Button type="primary" htmlType="submit">
              บันทึก
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
