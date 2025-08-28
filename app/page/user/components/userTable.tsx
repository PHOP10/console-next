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
} from "antd";
import { ColumnsType } from "antd/es/table";
import { UserType } from "../../common";
import { userService } from "../services/user.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import UserForm from "./userForm";

interface UserTableProps {
  data: UserType[];
  loading: boolean;
  fetchData: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<UserType[]>>;
}

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
      const body = {
        ...values,
        userId: editingUser.userId,
      };

      const result = await intraAuthService.updateUser(body);

      if (result && Array.isArray(result) && result.length === 0) {
        throw new Error("API returned error");
      }

      message.success("แก้ไขข้อมูลสำเร็จ");
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Update user error:", error);
      message.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await intraAuthService.deleteUser(id);
      message.success("ลบผู้ใช้สำเร็จ");
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถลบผู้ใช้ได้");
    }
  };

  const columns: ColumnsType<UserType> = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "ชื่อ", dataIndex: "firstName", key: "firstName" },
    { title: "นามสกุล", dataIndex: "lastName", key: "lastName" },
    { title: "ชื่อเล่น", dataIndex: "nickName", key: "nickName" },
    { title: "อีเมล", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?"
            onConfirm={() => handleDelete(record.id)}
            okText="ใช่"
            cancelText="ยกเลิก"
          >
            <Button type="primary" size="small" danger>
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <UserForm fetchData={fetchData} />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
      />

      <Modal
        title="แก้ไขข้อมูลผู้ใช้"
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
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
          <Form.Item label="Role" name="role">
            <Select
              options={[
                { label: "ผู้ใช้", value: "user" },
                { label: "หัวหน้า", value: "admin" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserTable;
