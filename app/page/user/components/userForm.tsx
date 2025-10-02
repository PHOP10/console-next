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
      <div
        style={{
          textAlign: "center",
          fontSize: "20px",
          fontWeight: "bold",
          color: "#0683e9",
          marginBottom: "12px",
        }}
      >
        จัดการข้อมูลผู้ใช้
      </div>

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
            label="รหัสพนักงาน"
            name="employeeId"
            rules={[{ required: true, message: "กรุณากรอกรหัสพนักงาน" }]}
          >
            <Input />
          </Form.Item>
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

          <Form.Item
            label="ชื่อเล่น"
            name="nickName"
            rules={[{ required: true, message: "กรุณากรอกชื่อเล่น" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="อีเมล"
            name="email"
            rules={[
              { required: true, message: "กรุณากรอกอีเมล" },
              { type: "email", message: "อีเมลไม่ถูกต้อง" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="เบอร์โทร"
            name="phoneNumber"
            rules={[
              { required: true, message: "กรุณากรอกเบอร์โทร" },
              { pattern: /^[0-9]{10}$/, message: "กรุณากรอกเบอร์โทร 10 หลัก" },
            ]}
          >
            <Input />
          </Form.Item>

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
                { label: "เจ้าหน้าที่พนักงาน", value: "เจ้าหน้าที่พนักงาน" },
              ]}
            />
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
                { label: "ผู้ดูแลระบบคลังยา", value: "pharmacy" },
                { label: "ผู้ดูแลระบบครุภัณฑ์", value: "asset" },
                { label: "ผู้ดูแลระบบเยี่ยมบ้าน", value: "home" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserForm;
