"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Select,
  message,
  Card,
} from "antd";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType } from "../../common";

export default function maDrugForm() {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  const [drugs, setDrugs] = useState<DrugType[]>([]);
  const [loading, setLoading] = useState(false);

  // โหลดรายการยา
  const fetchDrugs = async () => {
    try {
      const result = await intraAuthService.getDrugQuery?.(); // ต้องมีฟังก์ชันนี้ใน service
      setDrugs(Array.isArray(result) ? result : result?.data || []);
    } catch (error) {
      message.error("ไม่สามารถดึงข้อมูลยาได้");
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  // เมื่อกดบันทึก
  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const payload = {
        ...values,
        requestDate: values.requestDate.toISOString(), // แปลง Date เป็น ISO string
      };

      await intraAuthService.createMaDrug(payload);
      message.success("บันทึกการเบิกยาสำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("บันทึกข้อมูลล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="ทำรายการเบิกจ่ายยา">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ roundNumber: 1 }}
      >
        <Form.Item
          label="รหัสเบิกยา (MaDrugId)"
          name="MaDrugId"
          rules={[{ required: true, message: "กรุณากรอกรหัสเบิกยา" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="เลขที่เบิก"
          name="requestNumber"
          rules={[{ required: true, message: "กรุณากรอกเลขที่เบิก" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="หน่วยงานที่เบิก"
          name="requestUnit"
          rules={[{ required: true, message: "กรุณากรอกหน่วยงานที่เบิก" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="เบิกครั้งที่"
          name="roundNumber"
          rules={[{ required: true, message: "กรุณากรอกครั้งที่เบิก" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="ผู้ขอเบิก"
          name="requesterName"
          rules={[{ required: true, message: "กรุณากรอกชื่อผู้ขอเบิก" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="ผู้จัดยา"
          name="dispenserName"
          rules={[{ required: true, message: "กรุณากรอกชื่อผู้จัดยา" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="วันที่ขอเบิก"
          name="requestDate"
          rules={[{ required: true, message: "กรุณาเลือกวันที่ขอเบิก" }]}
        >
          <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="จำนวนที่เบิก"
          name="quantityUsed"
          rules={[{ required: true, message: "กรุณากรอกจำนวนที่เบิก" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="หมายเหตุ" name="note">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="รายการยา"
          name="drugId"
          rules={[{ required: true, message: "กรุณาเลือกรายการยา" }]}
        >
          <Select placeholder="เลือกยา">
            {drugs.map((drug) => (
              <Select.Option key={drug.DrugId} value={drug.DrugId}>
                {drug.name} ({drug.packagingSize})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            บันทึกข้อมูล
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
