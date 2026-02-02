"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  ConfigProvider,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import th_TH from "antd/locale/th_TH";
import { UserType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { userService } from "../services/user.service";
import { buddhistLocale } from "@/app/common";

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

  // --- Style Constants (เหมือนหน้าเพิ่มผู้ใช้) ---
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
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={loading}
      okText="บันทึก"
      cancelButtonProps={{ style: { display: "none" } }} // ซ่อนปุ่มยกเลิก
      width={800}
      centered
      destroyOnClose
      styles={{
        content: { borderRadius: "20px", padding: "30px" },
        header: { marginBottom: "20px" },
      }}
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
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
                maxLength={2} // 1. จำกัดให้พิมพ์ได้แค่ 2 ตัว
                // 2. (ตัวเลือกเสริม) ป้องกันการพิมพ์ตัวหนังสือ พิมพ์ได้เฉพาะตัวเลข
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              label="ชื่อ"
              name="firstName"
              rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
            >
              <Input placeholder="ชื่อ" className={inputStyle} />
            </Form.Item>

            {/* 5. LastName */}
            <Form.Item
              label="นามสกุล"
              name="lastName"
              rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
            >
              <Input placeholder="นามสกุล" className={inputStyle} />
            </Form.Item>

            {/* 8. Email */}
            <Form.Item
              label="อีเมล"
              name="email"
              rules={[{ type: "email", message: "อีเมลไม่ถูกต้อง" }]}
            >
              <Input placeholder="example@email.com" className={inputStyle} />
            </Form.Item>

            {/* 9. Phone */}
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
                placeholder="0xxxxxxxxx"
                className={inputStyle}
                maxLength={10}
                inputMode="numeric"
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              label="วันเริ่มงาน"
              name="startDate"
              rules={[{ required: true, message: "กรุณาเลือกวันเริ่มงาน" }]}
            >
              <DatePicker
                locale={buddhistLocale}
                // format="D MMMM BBBB"
                style={{ width: "100%" }}
                className="h-11 shadow-sm rounded-xl border-gray-300 hover:border-blue-400"
                placeholder="เลือกวันที่เริ่มงาน"
                format={(value) =>
                  value
                    ? `${value.format("DD  MMMM")}  ${value.year() + 543}`
                    : ""
                }
              />
            </Form.Item>

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
                <Select.Option value="เจ้าพนักงานสาธารณสุข">
                  เจ้าพนักงานสาธารณสุข
                </Select.Option>
              </Select>
            </Form.Item>

            {/* 10. Role */}
            <Form.Item
              label="สิทธิ์การใช้งาน"
              name="role"
              rules={[{ required: true, message: "กรุณาเลือกสิทธิ์การใช้งาน" }]}
            >
              <Select
                placeholder="เลือกสิทธิ์การใช้งาน"
                className={selectStyle}
              >
                <Select.Option value="user">ผู้ใช้</Select.Option>
                <Select.Option value="admin">หัวหน้า</Select.Option>
                <Select.Option value="pharmacy">
                  ผู้ดูแลระบบคลังยา
                </Select.Option>
                <Select.Option value="asset">ผู้ดูแลระบบครุภัณฑ์</Select.Option>
                <Select.Option value="home">
                  ผู้ดูแลระบบเยี่ยมบ้าน
                </Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
}
