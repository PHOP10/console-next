"use client";

import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  message,
  Button,
  DatePicker,
  Row,
  Col,
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../services/user.service";

interface UserFormProps {
  fetchData: () => Promise<void>;
}

const UserForm: React.FC<UserFormProps> = ({ fetchData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. เพิ่ม State สำหรับ Loading
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);

  const handleAddUser = async () => {
    try {
      const values = await form.validateFields();

      // เปิด Loading ก่อนเริ่มยิง API
      setLoading(true);

      const payload = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        // 2. ลบ createdAt ออก (ให้ Backend จัดการเอง ปลอดภัยกว่า)
      };

      await intraAuthService.createUser(payload);

      message.success("เพิ่มผู้ใช้สำเร็จ");
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err: any) {
      if (err?.errorFields) return; // เงียบไว้ถ้าเป็น validate error
      console.error("Create User Error:", err);
      message.error("ไม่สามารถเพิ่มผู้ใช้ได้");
    } finally {
      // ปิด Loading ไม่ว่าจะสำเร็จหรือล้มเหลว
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  // สร้าง Style กลางสำหรับ Select ให้เหมือน Input
  const selectStyle =
    "h-11 [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  return (
    <>
      <div className="flex justify-start mb-4">
        <Button
          type="primary"
          onClick={() => {
            form.resetFields();
            setIsModalOpen(true);
          }}
          className="h-10 px-6 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-[#0683e9] border-none flex items-center"
        >
          + เพิ่มผู้ใช้
        </Button>
      </div>

      <Modal
        title={
          <div className="text-xl font-bold text-[#0683e9] text-center w-full">
            เพิ่มผู้ใช้
          </div>
        }
        open={isModalOpen}
        onOk={handleAddUser}
        // 3. เพิ่ม confirmLoading เพื่อหมุนติ้วๆ ที่ปุ่มบันทึก
        confirmLoading={loading}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelButtonProps={{ style: { display: "none" } }}
        width={800}
        centered
        styles={{
          content: { borderRadius: "20px", padding: "30px" },
          header: { marginBottom: "20px" },
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
                className={selectStyle}
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
                className="h-11 shadow-sm rounded-xl border-gray-300 hover:border-blue-400"
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
              rules={[
                { required: true, message: "กรุณากรอกรหัสพนักงาน" },
                {
                  pattern: /^[0-9]{2}$/,
                  message: "กรุณากรอกตัวเลข 2 หลัก (00-99)",
                },
              ]}
            >
              <Input
                placeholder="รหัสพนักงาน"
                className={inputStyle}
                maxLength={2}
                // 4. เพิ่ม inputMode เพื่อให้มือถือเด้งแป้นตัวเลข
                inputMode="numeric"
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>

            {/* 8. Position */}
            <Form.Item
              label="ตำแหน่ง"
              name="position"
              rules={[{ required: true, message: "กรุณาเลือกตำแหน่ง" }]}
            >
              <Select
                placeholder="เลือกตำแหน่ง"
                className={selectStyle}
                options={[
                  { label: "ผู้อำนวยการ รพ.สต.", value: "ผู้อำนวยการ รพ.สต." },
                  { label: "พยาบาลวิชาชีพ", value: "พยาบาลวิชาชีพ" },
                  {
                    label: "นักวิชาการสาธารณสุข",
                    value: "นักวิชาการสาธารณสุข",
                  },
                  {
                    label: "เจ้าพนักงานสาธารณสุข",
                    value: "เจ้าพนักงานสาธารณสุข",
                  },
                ]}
              />
            </Form.Item>

            {/* 9. Email */}
            <Form.Item
              label="อีเมล"
              name="email"
              rules={[{ type: "email", message: "อีเมลไม่ถูกต้อง" }]}
            >
              <Input placeholder="Email" className={inputStyle} />
            </Form.Item>

            {/* 10. Phone */}
            <Form.Item
              label="เบอร์โทร"
              name="phoneNumber"
              rules={[
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
                // 4. เพิ่ม inputMode เพื่อให้มือถือเด้งแป้นตัวเลข
                inputMode="numeric"
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>

            {/* 11. Role */}
            <Form.Item
              label="สิทธิ์การใช้งานระบบ"
              name="role"
              initialValue="user"
              rules={[{ required: true, message: "กรุณาเลือกสิทธิ์การใช้งาน" }]}
            >
              <Select
                className={selectStyle}
                options={[
                  { label: "หัวหน้า", value: "admin" },
                  { label: "ผู้ดูแลระบบคลังยา", value: "pharmacy" },
                  { label: "ผู้ดูแลระบบครุภัณฑ์", value: "asset" },
                  { label: "ผู้ดูแลระบบเยี่ยมบ้าน", value: "home" },
                  { label: "ผู้ใช้งานทั่วไป", value: "user" },
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
