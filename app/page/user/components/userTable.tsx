"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  message,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag, // เพิ่ม Tag
  Tooltip,
  Col,
  DatePicker,
  Row,
  ConfigProvider,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { UserType } from "../../common";
import { userService } from "../services/user.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import UserForm from "./userForm";
import { EditOutlined, DeleteOutlined, FormOutlined } from "@ant-design/icons"; // เพิ่ม Icon
import locale from "antd/es/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
dayjs.locale("th");

interface UserTableProps {
  data: UserType[];
  loading: boolean;
  fetchData: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<UserType[]>>;
}

const PRIMARY_COLOR = "#00a191"; // กำหนดสีหลัก

const UserTable: React.FC<UserTableProps> = ({ data, loading, fetchData }) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [form] = Form.useForm();

  const handleEdit = (record: UserType) => {
    setEditingUser(record);
    form.setFieldsValue({
      ...record,
      // แปลง String ให้เป็น Dayjs Object
      createdAt: record.createdAt ? dayjs(record.createdAt) : null,
      startDate: record.startDate ? dayjs(record.startDate) : null,
    });
    // form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      if (!editingUser) return;
      const values = await form.validateFields();
      const body = {
        ...values,
        userId: editingUser.userId,
        startDate: values.startDate ? values.startDate.toISOString() : null,
      };

      const result = await intraAuthService.updateUser(body);

      if (result && Array.isArray(result) && result.length === 0) {
        throw new Error("API returned error");
      }

      message.success("แก้ไขข้อมูลสำเร็จ");
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await intraAuthService.deleteUser(id);
      message.success("ลบผู้ใช้สำเร็จ");
      fetchData();
    } catch (err) {
      message.error("ไม่สามารถลบผู้ใช้ได้");
    }
  };

  const columns: ColumnsType<UserType> = [
    { title: "รหัสพนักงาน", dataIndex: "employeeId", key: "employeeId" },
    {
      title: "ชื่อ",
      dataIndex: "firstName",
      key: "firstName",
      align: "center",
    },
    {
      title: "นามสกุล",
      dataIndex: "lastName",
      key: "lastName",
      align: "center",
    },
    {
      title: "ชื่อเล่น",
      dataIndex: "nickName",
      key: "nickName",
      align: "center",
    },
    { title: "อีเมล", dataIndex: "email", key: "email", align: "center" },
    {
      title: "เบอร์โทร",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      align: "center",
    },
    {
      title: "ตำแหน่ง",
      dataIndex: "position",
      key: "position",
      align: "center",
    },
    {
      title: "ความรับผิดชอบ",
      dataIndex: "role",
      key: "role",
      align: "center",
      render: (role: string) => {
        const roleConfig: Record<string, { label: string; color: string }> = {
          admin: { label: "หัวหน้า", color: "volcano" },
          user: { label: "ผู้ใช้", color: "cyan" },
          pharmacy: { label: "ผู้ดูแลคลังยา", color: "green" },
          asset: { label: "ผู้ดูแลครุภัณฑ์", color: "purple" },
        };
        const config = roleConfig[role] || { label: role, color: "default" };
        return <Tag color={config.color}>{config.label}</Tag>;
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
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Tooltip title="ลบข้อมูล">
            <Popconfirm
              title="ยืนยันการลบ"
              description="คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?"
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
                  marginLeft: 12,
                }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="custom-table-container">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* 1. เคลียร์ Border เดิมของ Ant Design เพื่อป้องกันเส้นซ้อน */
        .custom-table-container .ant-table-wrapper .ant-table-container,
        .custom-table-container .ant-table-wrapper .ant-table-content,
        .custom-table-container .ant-table-wrapper table {
          border: none !important;
        }

        /* 2. บังคับให้ยุบเส้นที่ซ้อนกัน (แก้ปัญหาเส้นหนาบางไม่เท่ากัน) */
        .custom-table-container table {
          border-collapse: collapse !important;
          border: 1px solid #000 !important; /* เส้นขอบนอกสุด */
          width: 100% !important;
        }

        /* 3. กำหนดเส้นแบ่งคอลัมน์และแถวให้หนา 1px เท่ากันทุกด้าน */
        .custom-table-container .ant-table-thead > tr > th,
        .custom-table-container .ant-table-tbody > tr > td {
          border: 1px solid #000 !important; /* ใส่เส้นให้ทุกช่อง */
          padding: 12px px !important;
          border-radius: 0 !important;
        }

        /* 4. สีหัวตาราง */
        .custom-table-container .ant-table-thead > tr > th {
          background-color: #d9fcf4 !important; 
          color: ${PRIMARY_COLOR} !important;
          font-weight: bold;
          text-align: center !important;
        }

        /* 5. เอามุมโค้งออกเพื่อให้เส้นตารางสีดำเชื่อมกันสนิท */
        .ant-table-wrapper .ant-table-container {
          border-radius: 0 !important;
        } 
      `,
        }}
      />

      <UserForm fetchData={fetchData} />

      <Table
        className="custom-table"
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={
          <span style={{ color: PRIMARY_COLOR }}>📝 แก้ไขข้อมูลผู้ใช้</span>
        }
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="ชื่อผู้ใช้"
                name="username"
                rules={[{ required: true, message: "กรุณากรอก Username" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="เพศ"
                name="gender"
                rules={[{ required: true, message: "กรุณาเลือกเพศ" }]}
              >
                <Select
                  placeholder="เลือกเพศ"
                  options={[
                    { label: "นาย", value: "male" },
                    { label: "นาง", value: "female" },
                    { label: "นางสาว", value: "miss" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <ConfigProvider locale={locale}>
                <Form form={form} layout="vertical">
                  <Form.Item
                    label="วันเริ่มงาน"
                    name="startDate"
                    rules={[
                      { required: true, message: "กรุณาเลือกวันเริ่มงาน" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="เลือกวันที่เริ่มงาน"
                      format={(value) =>
                        value
                          ? `${value.format("DD / MMMM")} / ${
                              value.year() + 543
                            }`
                          : ""
                      }
                    />
                  </Form.Item>
                </Form>
              </ConfigProvider>
            </Col>
            <Col span={12}>
              <Form.Item
                label="ชื่อ"
                name="firstName"
                rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
              >
                <Input />
              </Form.Item>
            </Col>{" "}
            <Col span={12}>
              <Form.Item
                label="นามสกุล"
                name="lastName"
                rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="ชื่อเล่น" name="nickName">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="รหัสพนักงาน"
                name="employeeId"
                rules={[{ required: true, message: "กรุณากรอกรหัสพนักงาน" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="อีเมล"
                name="email"
                rules={[{ type: "email", message: "อีเมลไม่ถูกต้อง" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="เบอร์โทร"
                name="phoneNumber"
                rules={[
                  { required: true, message: "กรุณากรอกเบอร์โทร" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "กรุณากรอกเบอร์โทร 10 หลัก",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="ตำแหน่ง"
                name="position"
                rules={[{ required: true, message: "กรุณาเลือกตำแหน่ง" }]}
              >
                <Select
                  placeholder="เลือกตำแหน่ง"
                  options={[
                    {
                      label: "ผู้อำนวยการสถานีอนามัย",
                      value: "ผู้อำนวยการสถานีอนามัย",
                    },
                    { label: "พยาบาลวิชาชีพ", value: "พยาบาลวิชาชีพ" },
                    {
                      label: "นักวิชาการสาธารณสุข",
                      value: "นักวิชาการสาธารณสุข",
                    },
                    {
                      label: "เจ้าหน้าที่พนักงาน",
                      value: "เจ้าหน้าที่พนักงาน",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="ระดับผู้ใช้"
                name="role"
                initialValue="user"
                rules={[{ required: true, message: "กรุณาเลือก Role" }]}
              >
                <Select
                  options={[
                    { label: "ผู้ใช้", value: "user" },
                    { label: "หัวหน้า", value: "admin" },
                    { label: "ผู้ดูแลระบบคลังยา", value: "pharmacy" },
                    { label: "ผู้ดูแลระบบครุภัณฑ์", value: "asset" },
                    { label: "ผู้ดูแลระบบเยี่ยมบ้าน", value: "home" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default UserTable;
