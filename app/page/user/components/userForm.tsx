"use client";

import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  message,
  Button,
  Col,
  Row,
  DatePicker,
} from "antd";
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
      const payload = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        createdAt: values.createdAt ? values.createdAt.toISOString() : null,
      };
      // ส่ง payload (ข้อมูลที่แปลงแล้ว) ไปที่ Service
      await intraAuthService.createUser(payload);

      message.success("เพิ่มผู้ใช้สำเร็จ");
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err) {
      console.error("Create User Error:", err);
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
        width={800} // เพิ่มความกว้าง Modal เพื่อให้รองรับ 2 คอลัมน์
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            {/* แถวที่ 1 */}
            <Col span={12}>
              <Form.Item
                label="ชื่อผู้ใช้"
                name="username"
                rules={[{ required: true, message: "กรุณากรอก Username" }]}
              >
                <Input placeholder="Username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="รหัสผ่าน"
                name="password"
                rules={[{ required: true, message: "กรุณากรอก Password" }]}
              >
                <Input.Password placeholder="Password" />
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
              <Form.Item
                label="วันเริ่มงาน"
                name="startDate"
                rules={[{ required: true, message: "กรุณาเลือกวันเริ่มงาน" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="เลือกวันที่เริ่มงาน"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            {/* แถวที่ 2 */}
            <Col span={12}>
              <Form.Item
                label="ชื่อ"
                name="firstName"
                rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
              >
                <Input placeholder="ชื่อ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="นามสกุล"
                name="lastName"
                rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
              >
                <Input placeholder="นามสกุล" />
              </Form.Item>
            </Col>

            {/* แถวที่ 3 */}
            <Col span={12}>
              <Form.Item
                label="ชื่อเล่น"
                name="nickName"
                rules={[{ required: true, message: "กรุณากรอกชื่อเล่น" }]}
              >
                <Input placeholder="ชื่อเล่น" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="รหัสพนักงาน"
                name="employeeId"
                rules={[{ required: true, message: "กรุณากรอกรหัสพนักงาน" }]}
              >
                <Input placeholder="รหัสพนักงาน" />
              </Form.Item>
            </Col>

            {/* แถวที่ 4 */}
            <Col span={12}>
              <Form.Item
                label="อีเมล"
                name="email"
                rules={[
                  { required: true, message: "กรุณากรอกอีเมล" },
                  { type: "email", message: "อีเมลไม่ถูกต้อง" },
                ]}
              >
                <Input placeholder="Email" />
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
                <Input placeholder="เบอร์โทรศัพท์" maxLength={10} />
              </Form.Item>
            </Col>

            {/* แถวที่ 5 */}
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
    </>
  );
};

export default UserForm;
