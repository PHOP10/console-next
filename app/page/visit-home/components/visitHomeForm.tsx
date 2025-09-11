"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Row,
  Col,
  message,
  Select,
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { visitHomeServices } from "../services/visitHome.service";
import dayjs from "dayjs";
import { MasterPatientType } from "../../common";

import "./Form.css"; /* อันใหม่ */

const { Option } = Select;

export default function VisitHomeForm() {
  const [form] = Form.useForm();
  const [masterPatients, setMasterPatients] = useState<MasterPatientType[]>([]);
  const intraAuth = useAxiosAuth();
  const intraAuthService = visitHomeServices(intraAuth);

  const fetchMasterPatients = async () => {
    try {
      const res = await intraAuthService.getMasterPatientQuery();
      setMasterPatients(res);
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถดึงข้อมูลประเภทผู้ป่วยได้");
    }
  };

  useEffect(() => {
    fetchMasterPatients();
  }, []);

  const handleFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        age: Number(values.age),
        visitDate: values.visitDate
          ? dayjs(values.visitDate).toISOString()
          : null,
        nextAppointment: values.nextAppointment
          ? dayjs(values.nextAppointment).toISOString()
          : null,
        symptoms: values.symptoms || null,
        medication: values.medication || null,
        notes: values.notes || null,
        patientTypeId: values.patientTypeId || null, // เพิ่ม patientTypeId
      };

      await intraAuthService.createVisitHomeWaste(payload);

      message.success("บันทึกข้อมูลสำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleFinish}>

      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 20,
          marginBottom: 16,
          borderRadius: "8px",
          color: "#1890ff",
        }}
      >
        ฟอร์มบันทึกการเยี่ยมบ้าน
      </div>

      <Row gutter={16}>
        {/* ข้อมูลผู้ป่วย */}
        <Col span={12}>
          <Form.Item name="firstName" label="ชื่อ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="lastName"
            label="นามสกุล"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="age" label="อายุ" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="address"
            label="ที่อยู่"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="patientTypeId"
            label="ประเภทผู้ป่วย"
            rules={[{ required: true, message: "กรุณาเลือกประเภทผู้ป่วย" }]}
          >
            <Select placeholder="เลือกประเภทผู้ป่วย">
              {masterPatients.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.typeName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="visitDate"
            label="วันที่เยี่ยมบ้าน"
            rules={[{ required: true }]}
          >
            <DatePicker
              format="DD-MM-YYYY"
              style={{ width: "100%" }}
              disabledDate={(current) => {
                // ปิดวันที่ก่อนวันนี้
                return current && current < dayjs().startOf("day");
              }}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="nextAppointment" label="นัดครั้งถัดไป">
            <DatePicker
              format="DD-MM-YYYY"
              style={{ width: "100%" }}
              disabledDate={(current) => {
                // ปิดวันที่ก่อนวันนี้
                return current && current < dayjs().startOf("day");
              }}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="symptoms" label="อาการ">
            <Input.TextArea rows={1} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="medication" label="การใช้ยา">
            <Input.TextArea rows={1} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="notes" label="หมายเหตุ">
            <Input.TextArea rows={1} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item className="submit-button-item" style={{ textAlign: "center" }}>
        <Button type="primary" htmlType="submit">
          บันทึก
        </Button>
      </Form.Item>
    </Form>
  );
}
