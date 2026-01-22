"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Select, message, Button, DatePicker } from "antd";
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
      const payload = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        createdAt: values.createdAt ? values.createdAt.toISOString() : null,
      };
      await intraAuthService.createUser(payload);

      message.success("เพิ่มผู้ใช้สำเร็จ");
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err: any) {
      if (err?.errorFields) return;
      console.error("Create User Error:", err);
      message.error("ไม่สามารถเพิ่มผู้ใช้ได้");
    }
  };

  // --- Class สำหรับ Input ที่เน้นมิติ (Dimension) ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          form.resetFields();
          setIsModalOpen(true);
        }}
        className="mb-4 ml-2 h-10 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
      >
        + เพิ่มผู้ใช้
      </Button>

      <Modal
        // --- ปรับส่วน Title ตรงนี้ ---
        title={
          <div className="text-xl font-bold text-[#0683e9] text-center w-full">
            เพิ่มผู้ใช้
          </div>
        }
        open={isModalOpen}
        onOk={handleAddUser}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={800}
        centered
        styles={{
          content: { borderRadius: "20px", padding: "30px" },
          header: { marginBottom: "20px" }, // เพิ่มระยะห่างใต้หัวข้อเล็กน้อย
        }}
      >
        <Form form={form} layout="vertical" className="mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            {/* 1. Username */}
            <Form.Item
              label="ชื่อผู้ใช้"
              name="username"
              rules={[{ required: true, message: "กรุณากรอก Username" }]}
            >
              <Input placeholder="Username" className={inputStyle} />
            </Form.Item>

            {/* 2. Password */}
            <Form.Item
              label="รหัสผ่าน"
              name="password"
              initialValue="User@123"
              rules={[{ required: true, message: "กรุณากรอก Password" }]}
            >
              <Input.Password placeholder="Password" className={inputStyle} />
            </Form.Item>

            {/* 3. Gender */}
            <Form.Item
              label="เพศ"
              name="gender"
              rules={[{ required: true, message: "กรุณาเลือกเพศ" }]}
            >
              <Select
                placeholder="เลือกเพศ"
                className="h-11 [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm"
                options={[
                  { label: "นาย", value: "male" },
                  { label: "นาง", value: "female" },
                  { label: "นางสาว", value: "miss" },
                ]}
              />
            </Form.Item>

            {/* 4. StartDate */}
            <Form.Item
              label="วันเริ่มงาน"
              name="startDate"
              rules={[{ required: true, message: "กรุณาเลือกวันเริ่มงาน" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="เลือกวันที่เริ่มงาน"
                format="DD/MM/YYYY"
                className="h-11 shadow-sm rounded-xl border-gray-300"
              />
            </Form.Item>

            {/* 5. FirstName */}
            <Form.Item
              label="ชื่อ"
              name="firstName"
              rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
            >
              <Input placeholder="ชื่อ" className={inputStyle} />
            </Form.Item>

            {/* 6. LastName */}
            <Form.Item
              label="นามสกุล"
              name="lastName"
              rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
            >
              <Input placeholder="นามสกุล" className={inputStyle} />
            </Form.Item>

            {/* 7. EmployeeID */}
            <Form.Item
              label="รหัสพนักงาน"
              name="employeeId"
              rules={[{ required: true, message: "กรุณากรอกรหัสพนักงาน" }]}
            >
              <Input placeholder="รหัสพนักงาน" className={inputStyle} />
            </Form.Item>

            {/* 8. Position */}
            <Form.Item
              label="ตำแหน่ง"
              name="position"
              rules={[{ required: true, message: "กรุณาเลือกตำแหน่ง" }]}
            >
              <Select
                placeholder="เลือกตำแหน่ง"
                className="h-11 [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm"
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

            {/* 9. Email */}
            <Form.Item
              label="อีเมล"
              name="email"
              rules={[
                { required: true, message: "กรุณากรอกอีเมล" },
                { type: "email", message: "อีเมลไม่ถูกต้อง" },
              ]}
            >
              <Input placeholder="Email" className={inputStyle} />
            </Form.Item>

            {/* 10. Phone */}
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
              <Input
                placeholder="เบอร์โทรศัพท์"
                maxLength={10}
                className={inputStyle}
              />
            </Form.Item>

            {/* 11. Role */}
            <Form.Item
              label="ระดับผู้ใช้"
              name="role"
              initialValue="user"
              rules={[{ required: true, message: "กรุณาเลือก Role" }]}
            >
              <Select
                className="h-11 [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm"
                options={[
                  { label: "ผู้ใช้", value: "user" },
                  { label: "หัวหน้า", value: "admin" },
                  { label: "ผู้ดูแลระบบคลังยา", value: "pharmacy" },
                  { label: "ผู้ดูแลระบบครุภัณฑ์", value: "asset" },
                  { label: "ผู้ดูแลระบบเยี่ยมบ้าน", value: "home" },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default UserForm;
