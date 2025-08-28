"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Select, message, Button } from "antd";
import { UserType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../services/user.service";

interface UserFormProps {
  fetchData: () => Promise<void>;
}

const UserForm: React.FC<UserFormProps> = ({ fetchData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);

  const handleAddUser = async () => {
    try {
      const values = await form.validateFields();
      await intraAuthService.createUser(values);
      message.success("เพิ่มผู้ใช้สำเร็จ");
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถเพิ่มผู้ใช้ได้");
    }
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => setIsModalOpen(true)}
        style={{ marginBottom: 16 }}
      >
        เพิ่มผู้ใช้
      </Button>

      <Modal
        title="เพิ่มผู้ใช้"
        open={isModalOpen}
        onOk={handleAddUser}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="ชื่อผู้ใช้"
            name="username"
            rules={[{ required: true, message: "กรุณากรอก Username" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="รหัสผ่าน"
            name="password"
            rules={[{ required: true, message: "กรุณากรอก Password" }]}
          >
            <Input.Password />
          </Form.Item>
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
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserForm;
