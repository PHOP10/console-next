"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Button,
  Row,
  Col,
  ConfigProvider,
} from "antd";
import dayjs from "dayjs";
import th_TH from "antd/locale/th_TH";
import { UserType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../services/user.service";

interface UserEditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: UserType | null;
}

export default function UserEditModal({
  open,
  onClose,
  onSuccess,
  record,
}: UserEditModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const intraAuth = useAxiosAuth();
  const intraAuthService = userService(intraAuth);

  useEffect(() => {
    if (open && record) {
      form.setFieldsValue({
        ...record,
        startDate: record.startDate ? dayjs(record.startDate) : null,
      });
    } else {
      form.resetFields();
    }
  }, [open, record, form]);

  const handleUpdate = async (values: any) => {
    if (!record) return;
    try {
      setLoading(true);
      const payload = {
        ...values,
        userId: record.userId,
        startDate: values.startDate ? values.startDate.toISOString() : null,
      };

      await intraAuthService.updateUser(payload);
      message.success("แก้ไขข้อมูลสำเร็จ");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating:", error);
      message.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // --- Style Constants ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  return (
    <Modal
      title={
        <div className="text-xl font-bold text-[#0683e9] text-center w-full">
          แก้ไขข้อมูลผู้ใช้
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      destroyOnClose
      styles={{
        content: { borderRadius: "20px", padding: "24px" },
        header: {
          marginBottom: "16px",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "12px",
        },
      }}
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          {/* Row 1: ชื่อผู้ใช้, เพศ */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="ชื่อผู้ใช้"
                name="username"
                rules={[{ required: true, message: "กรุณากรอก Username" }]}
              >
                <Input placeholder="Username" className={inputStyle} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="เพศ"
                name="gender"
                rules={[{ required: true, message: "กรุณาเลือกเพศ" }]}
              >
                <Select placeholder="เลือกเพศ" className={selectStyle}>
                  <Select.Option value="male">นาย</Select.Option>
                  <Select.Option value="female">นาง</Select.Option>
                  <Select.Option value="miss">นางสาว</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Row 2: วันเริ่มงาน, รหัสพนักงาน */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="วันเริ่มงาน"
                name="startDate"
                rules={[{ required: true, message: "กรุณาเลือกวันเริ่มงาน" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-2`}
                  placeholder="เลือกวันที่เริ่มงาน"
                  format={(value) =>
                    value
                      ? `${value.format("DD / MMMM")} / ${value.year() + 543}`
                      : ""
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="รหัสพนักงาน"
                name="employeeId"
                rules={[{ required: true, message: "กรุณากรอกรหัสพนักงาน" }]}
              >
                <Input placeholder="รหัสพนักงาน" className={inputStyle} />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 3: ชื่อ, นามสกุล */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="ชื่อ"
                name="firstName"
                rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
              >
                <Input placeholder="ชื่อจริง" className={inputStyle} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="นามสกุล"
                name="lastName"
                rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
              >
                <Input placeholder="นามสกุล" className={inputStyle} />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 4: อีเมล, เบอร์โทร */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="อีเมล"
                name="email"
                rules={[{ type: "email", message: "อีเมลไม่ถูกต้อง" }]}
              >
                <Input placeholder="example@email.com" className={inputStyle} />
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
                <Input
                  placeholder="0xxxxxxxxx"
                  maxLength={10}
                  className={inputStyle}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 5: ตำแหน่ง, ระดับผู้ใช้ */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="ตำแหน่ง"
                name="position"
                rules={[{ required: true, message: "กรุณาเลือกตำแหน่ง" }]}
              >
                <Select placeholder="เลือกตำแหน่ง" className={selectStyle}>
                  <Select.Option value="ผู้อำนวยการสถานีอนามัย">
                    ผู้อำนวยการสถานีอนามัย
                  </Select.Option>
                  <Select.Option value="พยาบาลวิชาชีพ">
                    พยาบาลวิชาชีพ
                  </Select.Option>
                  <Select.Option value="นักวิชาการสาธารณสุข">
                    นักวิชาการสาธารณสุข
                  </Select.Option>
                  <Select.Option value="เจ้าหน้าที่พนักงาน">
                    เจ้าหน้าที่พนักงาน
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="ระดับผู้ใช้"
                name="role"
                rules={[{ required: true, message: "กรุณาเลือก Role" }]}
              >
                <Select placeholder="เลือก Role" className={selectStyle}>
                  <Select.Option value="user">ผู้ใช้</Select.Option>
                  <Select.Option value="admin">หัวหน้า</Select.Option>
                  <Select.Option value="pharmacy">
                    ผู้ดูแลระบบคลังยา
                  </Select.Option>
                  <Select.Option value="asset">
                    ผู้ดูแลระบบครุภัณฑ์
                  </Select.Option>
                  <Select.Option value="home">
                    ผู้ดูแลระบบเยี่ยมบ้าน
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              onClick={onClose}
              className="h-10 px-6 rounded-lg text-gray-600 hover:bg-gray-100 border-gray-300"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0"
            >
              บันทึก
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
}
