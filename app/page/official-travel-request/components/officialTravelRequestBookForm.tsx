"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, Button, DatePicker, Select, message, Spin } from "antd";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";

const { RangePicker } = DatePicker;

interface MasterCar {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
}

export default function OfficialTravelRequestBookForm() {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const service = officialTravelRequestService(intraAuth);

  const [cars, setCars] = useState<MasterCar[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // ดึงข้อมูลรถ
  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await service.getMasterCarQuery();
      setCars(res);
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถดึงข้อมูลรถได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        documentNo: values.documentNo,
        title: values.title,
        missionDetail: values.missionDetail,
        location: values.location,
        startDate: values.range[0].toISOString(),
        endDate: values.range[1].toISOString(),
        carId: values.carId || null,
        status: "pending",
      };

      await service.createOfficialTravelRequest(payload);
      message.success("บันทึกคำขอเรียบร้อยแล้ว");
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("บันทึกคำขอไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spin />;

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="เลขที่เอกสาร"
        name="documentNo"
        rules={[{ required: true, message: "กรุณากรอกเลขที่เอกสาร" }]}
      >
        <Input placeholder="กรอกเลขที่เอกสาร" />
      </Form.Item>

      <Form.Item
        label="เรื่อง"
        name="title"
        rules={[{ required: true, message: "กรุณากรอกเรื่อง" }]}
      >
        <Input placeholder="กรอกเรื่อง" />
      </Form.Item>

      <Form.Item
        label="รายละเอียดภารกิจ"
        name="missionDetail"
        rules={[{ required: true, message: "กรุณากรอกรายละเอียดภารกิจ" }]}
      >
        <Input.TextArea placeholder="กรอกรายละเอียดภารกิจ" rows={4} />
      </Form.Item>

      <Form.Item
        label="สถานที่"
        name="location"
        rules={[{ required: true, message: "กรุณากรอกสถานที่" }]}
      >
        <Input placeholder="กรอกสถานที่" />
      </Form.Item>

      <Form.Item
        label="วันที่เดินทาง"
        name="range"
        rules={[{ required: true, message: "กรุณาเลือกวันที่เดินทาง" }]}
      >
        <RangePicker />
      </Form.Item>

      <Form.Item label="เลือกรถ" name="carId">
        <Select placeholder="เลือกรถ (ไม่บังคับ)">
          {cars.map((car) => (
            <Select.Option key={car.id} value={car.id}>
              {car.licensePlate} ({car.brand} {car.model})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>
          บันทึกคำขอ
        </Button>
      </Form.Item>
    </Form>
  );
}
