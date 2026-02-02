"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Space,
  Row,
  Col,
  Tooltip,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import { MasterCarType } from "../../common";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import CustomTable from "../../common/CustomTable";

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

  const onFinish = async (values: any) => {
    try {
      const { carName, licensePlate } = values;
      const isDuplicate = data.some(
        (car: any) =>
          car.licensePlate === licensePlate || car.carName === carName,
      );
      if (isDuplicate) {
        const duplicateCar = data.find(
          (car: any) => car.licensePlate === licensePlate,
        );
        const msg = duplicateCar
          ? `ทะเบียนรถ "${licensePlate}" มีอยู่ในระบบแล้ว`
          : `ชื่อรถ "${carName}" มีอยู่ในระบบแล้ว`;

        return message.warning(msg);
      }

      const payload = {
        ...values,
        status: values.status || "available",
        mileage: values.mileage ? Number(values.mileage) : 0,
      };

      await intraAuthService.createMasterCar(payload);

      message.success("เพิ่มรถสำเร็จ");
      form.resetFields();
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409) {
        message.error("ข้อมูลนี้ถูกเพิ่มโดยผู้ใช้อื่นไปก่อนหน้าแล้ว");
      } else {
        message.error("เพิ่มรถไม่สำเร็จ");
      }
    }
  };

  const onEditFinish = async (values: any) => {
    if (!editingCar) return;
    try {
      const payload = {
        ...values,
        id: editingCar.id,
        mileage: values.mileage ? Number(values.mileage) : 0,
        numberType: values.numberType ? Number(values.numberType) : 0,
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
    {
      title: "ชื่อรถ",
      dataIndex: "carName",
      key: "carName",
      align: "center",
      width: 150,
    },
    {
      title: "ทะเบียนรถ",
      dataIndex: "licensePlate",
      key: "licensePlate",
      align: "center",
      width: 120,
    },
    {
      title: "ยี่ห้อ",
      dataIndex: "brand",
      key: "brand",
      align: "center",
      width: 100,
      responsive: ["sm"], // ซ่อนบนมือถือเล็กมาก
    },
    {
      title: "รุ่น",
      dataIndex: "model",
      key: "model",
      align: "center",
      width: 100,
      responsive: ["md"], // ซ่อนบนมือถือ
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 120,
      render: (status) => {
        const isAvailable = status === "available";
        return (
          <Tag color={isAvailable ? "green" : "red"}>
            {isAvailable ? "พร้อมใช้งาน" : "ไม่พร้อมใช้งาน"}
          </Tag>
        );
      },
    },
    {
      title: "รายละเอียด",
      dataIndex: "details",
      key: "details",
      align: "center",
      width: 150,
      ellipsis: true,
      responsive: ["lg"], // ซ่อนบนมือถือและจอเล็ก
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
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="แก้ไข">
            <EditOutlined
              style={{
                fontSize: 18, // ปรับขนาดไอคอนเป็น 18px
                color: "#faad14",
                cursor: "pointer",
                transition: "color 0.2s",
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
              okButtonProps={{ danger: true }}
            >
              <DeleteOutlined
                style={{
                  fontSize: 18, // ปรับขนาดไอคอนเป็น 18px
                  color: "#ff4d4f",
                  cursor: "pointer",
                }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Shared Form Items Component
  // Shared Form Items Component
  const CarFormItems = () => {
    const inputStyle =
      "w-full h-10 sm:h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-sm";
    const selectStyle =
      "h-10 sm:h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 hover:[&>.ant-select-selector]:!border-blue-400 text-sm";
    const textAreaStyle =
      "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 transition-all duration-300 text-sm";

    return (
      <>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="carName"
              label="ชื่อรถ"
              rules={[
                { required: true, message: "กรุณากรอกชื่อรถ" },
                {
                  validator: (_, value) => {
                    // Check duplicate name excluding current editing car
                    if (
                      data.some(
                        (car) =>
                          car.carName === value && car.id !== editingCar?.id,
                      )
                    ) {
                      return Promise.reject(new Error("ชื่อรถนี้มีในระบบแล้ว"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="กรอกชื่อรถ" className={inputStyle} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="numberType"
              label="หมายเลขรถ"
              rules={[
                { required: true, message: "กรุณากรอกหมายเลขรถ" },
                {
                  validator: (_, value) => {
                    if (
                      data.some(
                        (car) =>
                          car.numberType === value && car.id !== editingCar?.id,
                      )
                    ) {
                      return Promise.reject(
                        new Error("หมายเลขรถนี้มีในระบบแล้ว"),
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
                className={`${inputStyle} pt-1`}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="licensePlate"
              label="เลขทะเบียนรถ"
              rules={[
                { required: true, message: "กรุณากรอกเลขทะเบียนรถ" },
                {
                  validator: (_, value) => {
                    if (
                      data.some(
                        (car) =>
                          car.licensePlate === value &&
                          car.id !== editingCar?.id,
                      )
                    ) {
                      return Promise.reject(
                        new Error("ทะเบียนรถนี้มีในระบบแล้ว"),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="กรอกเลขทะเบียนรถ" className={inputStyle} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="brand"
              label="ยี่ห้อ"
              rules={[{ required: true, message: "กรุณากรอกยี่ห้อรถ" }]}
            >
              <Input placeholder="กรอกยี่ห้อรถ" className={inputStyle} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="model"
              label="รุ่น"
              rules={[{ required: true, message: "กรุณากรอกรุ่นรถ" }]}
            >
              <Input placeholder="กรอกรุ่นรถ" className={inputStyle} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="mileage"
              label="เลขไมล์รถ (กม.)"
              rules={[{ required: true, message: "กรุณาระบุเลขไมล์" }]}
            >
              <Input
                type="number"
                placeholder="กรอกเลขไมล์รถ"
                className={inputStyle}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="status"
              label="สถานะการใช้งาน"
              initialValue="available"
            >
              <Select className={selectStyle}>
                <Select.Option value="available">พร้อมใช้งาน</Select.Option>
                <Select.Option value="unavailable">
                  ไม่พร้อมใช้งาน (ซ่อม/งดใช้)
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="fuelType"
              label="ประเภทน้ำมัน"
              rules={[{ required: true, message: "กรุณาเลือกประเภทน้ำมัน" }]}
            >
              <Select placeholder="เลือกประเภทน้ำมัน" className={selectStyle}>
                <Select.Option value="ดีเซล">ดีเซล</Select.Option>
                <Select.Option value="เบนซิน 95">เบนซิน 95</Select.Option>
                <Select.Option value="แก๊สโซฮอล์ 91">
                  แก๊สโซฮอล์ 91
                </Select.Option>
                <Select.Option value="ไฟฟ้า">ไฟฟ้า (EV)</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="details" label="รายละเอียดเพิ่มเติม">
          <Input.TextArea
            rows={3}
            placeholder="ระบุข้อมูลอื่นๆ เช่น สีรถ, ประกันภัย"
            className={textAreaStyle}
          />
        </Form.Item>

        <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button
            type="primary"
            htmlType="submit"
            className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0 w-full sm:w-auto"
          >
            บันทึกข้อมูล
          </Button>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-2 tracking-tight">
          ข้อมูลรถราชการ
        </h2>
        <hr className="border-slate-100/30 -mx-6 md:-mx-6" />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          onClick={() => {
            form.resetFields();
            setIsModalOpen(true);
          }}
          className="mb-4 w-full sm:w-auto h-10 rounded-lg shadow-sm"
        >
          + เพิ่มรถ
        </Button>
      </div>

      <CustomTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        bordered
        size="small" // ใช้ size small บนมือถือ
        pagination={{ pageSize: 10, size: "small" }}
        scroll={{ x: "max-content" }} // เพิ่ม scroll แนวนอน
      />

      {/* Modal เพิ่มรถ */}
      <Modal
        title={
          <div className="text-lg sm:text-xl font-bold text-[#0683e9] text-center w-full">
            เพิ่มรถใหม่
          </div>
        }
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
        width={750}
        centered
        // Responsive Modal
        style={{ maxWidth: "100%", top: 20, paddingBottom: 0 }}
        styles={{
          content: { borderRadius: "16px", padding: "16px sm:24px" },
          header: {
            marginBottom: "16px",
            borderBottom: "1px solid #f0f0f0",
            paddingBottom: "12px",
          },
        }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <CarFormItems />
        </Form>
      </Modal>

      {/* Modal แก้ไขรถ */}
      <Modal
        title={
          <div className="text-lg sm:text-xl font-bold text-[#0683e9] text-center w-full">
            แก้ไขข้อมูลรถ
          </div>
        }
        open={isEditModalOpen}
        footer={null}
        onCancel={() => setIsEditModalOpen(false)}
        destroyOnClose
        width={750}
        centered
        style={{ maxWidth: "100%", top: 20, paddingBottom: 0 }}
        styles={{
          content: { borderRadius: "16px", padding: "16px sm:24px" },
          header: {
            marginBottom: "16px",
            borderBottom: "1px solid #f0f0f0",
            paddingBottom: "12px",
          },
        }}
      >
        <Form form={editForm} layout="vertical" onFinish={onEditFinish}>
          <CarFormItems />
        </Form>
      </Modal>
    </>
  );
}
