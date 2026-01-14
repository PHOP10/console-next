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
} from "antd";
import { ColumnsType } from "antd/es/table";
import { UserType } from "../../common";
import { userService } from "../services/user.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import UserForm from "./userForm";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons"; // เพิ่ม Icon

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
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      if (!editingUser) return;
      const values = await form.validateFields();
      const body = { ...values, userId: editingUser.userId };
      await intraAuthService.updateUser(body);
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
        <Space size="small">
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ borderColor: "#faad14", color: "#faad14" }}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="ยืนยันการลบผู้ใช้?"
            onConfirm={() => handleDelete(record.id)}
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
          >
            <Button danger ghost icon={<DeleteOutlined />}>
              ลบ
            </Button>
          </Popconfirm>
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
        bordered={false}
        pagination={{
          pageSize: 10,
          position: ["bottomCenter"],
          showSizeChanger: false,
        }}
        scroll={{ x: 800 }}
        style={{
          marginTop: "16px",
          marginBottom: "16px",
          marginLeft: "24px",
          marginRight: "24px",
        }}
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
        okButtonProps={{
          style: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="ชื่อ"
            name="firstName"
            rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="นามสกุล"
            name="lastName"
            rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="ชื่อเล่น" name="nickName">
            <Input />
          </Form.Item>
          <Form.Item
            label="อีเมล"
            name="email"
            rules={[{ type: "email", message: "อีเมลไม่ถูกต้อง" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="ความรับผิดชอบ" name="role">
            <Select
              options={[
                { label: "ผู้ใช้", value: "user" },
                { label: "หัวหน้า", value: "admin" },
                { label: "ผู้ดูแลคลังยา", value: "pharmacy" },
                { label: "ผู้ดูแลครุภัณฑ์", value: "asset" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserTable;
