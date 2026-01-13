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
  InputNumber,
  Divider,
  Card,
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { visitHomeServices } from "../services/visitHome.service";
import dayjs from "dayjs";
import { MasterPatientType } from "../../common";
import CryptoJS from "crypto-js";

import "./Form.css";

const { Option } = Select;
const { TextArea } = Input;

const SECRET_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "MY_SUPER_SECRET_KEY_1234";

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

  const encryptData = (data: string) => {
    if (!data) return null;
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  };

  const handleFinish = async (values: any) => {
    try {
      const payload = {
        patientTypeId: values.patientTypeId || null,
        age: values.age ? Number(values.age) : null,
        visitDate: values.visitDate
          ? dayjs(values.visitDate).toISOString()
          : null,
        referralDate: values.referralDate
          ? dayjs(values.referralDate).toISOString()
          : null,
        dob: values.dob ? dayjs(values.dob).toISOString() : null,
        admissionDate: values.admissionDate
          ? dayjs(values.admissionDate).toISOString()
          : null,
        dischargeDate: values.dischargeDate
          ? dayjs(values.dischargeDate).toISOString()
          : null,
        nextAppointment: values.nextAppointment
          ? dayjs(values.nextAppointment).toISOString()
          : null,
        temperature: values.temperature ? Number(values.temperature) : null,
        pulseRate: values.pulseRate ? Number(values.pulseRate) : null,
        respRate: values.respRate ? Number(values.respRate) : null,
        oxygenSat: values.oxygenSat ? Number(values.oxygenSat) : null,
        bloodPressure: values.bloodPressure || null,
        hhcNo: values.hhcNo || null,
        allergies: values.allergies || null,
        initialHistory: values.initialHistory || null,
        symptoms: values.symptoms || null,
        diagnosis: values.diagnosis || null,
        medication: values.medication || null,
        medicalEquipment: values.medicalEquipment || null,
        careNeeds: values.careNeeds || null,
        notes: values.notes || null,
        firstName: encryptData(values.firstName),
        lastName: encryptData(values.lastName),
        fullName: encryptData(values.fullName),
        hn: encryptData(values.hn),
        cid: encryptData(values.cid),
        phone: encryptData(values.phone),
        address: encryptData(values.address),
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
    <Form
      layout="vertical"
      form={form}
      onFinish={handleFinish}
      style={{ maxWidth: 1200, margin: "0 auto", padding: "0 10px" }} // เพิ่ม Padding เล็กน้อยกันชิดขอบจอ
    >
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "clamp(18px, 4vw, 24px)", // ขนาดฟอนต์ยืดหยุ่นตามหน้าจอ
          marginBottom: 24,
          color: "#1890ff",
          marginTop: 16,
        }}
      >
        แบบบันทึกการดูแลต่อเนื่องที่บ้าน
      </div>

      {/* --- ส่วนที่ 2: ข้อมูลส่วนตัวผู้ป่วย --- */}
      <Card title="ข้อมูลผู้ป่วย" className="mb-4" size="small">
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="hhcNo" label="เลขที่ HHC">
              <Input placeholder="ระบุเลขที่ HHC" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="referralDate" label="วันที่ส่ง">
              <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8}>
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
          <Col xs={24} sm={24} md={16}>
            <Form.Item
              name="fullName"
              label="ชื่อ-นามสกุล ผู้ป่วย"
              rules={[{ required: true, message: "กรุณากรอกชื่อ-นามสกุล" }]}
            >
              <Input placeholder="ระบุชื่อ-นามสกุล ผู้ป่วย" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Form.Item
              name="age"
              label="อายุ (ปี)"
              rules={[{ required: true }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                placeholder="ระบุอายุ"
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Form.Item name="hn" label="HN">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="dob"
              label="วันเดือนปีเกิด"
              rules={[{ required: true, message: "กรุณากรอกวันเดือนปีเกิด" }]}
            >
              <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="cid"
              label="เลขบัตรประชาชน"
              normalize={(value) => (value || "").replace(/[^0-9]/g, "")} // ลบตัวอักษรที่ไม่ใช่ตัวเลขออกทันที
              rules={[{ required: true, message: "กรุณากรอกเลขบัตรประชาชน" }]}
            >
              <Input
                maxLength={13}
                placeholder="กรอกเลขบัตร 13 หลัก"
                inputMode="numeric" // บังคับให้มือถือแสดงแป้นตัวเลข
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item
              name="phone"
              label="เบอร์โทรศัพท์"
              // 1. ยอมให้พิมพ์เฉพาะตัวเลข 0-9 เท่านั้น
              normalize={(value) => (value || "").replace(/[^0-9]/g, "")}
              // 2. (ตัวเลือกเสริม) ถ้าต้องการบังคับว่าต้องครบ 10 หลักถึงจะผ่าน
              rules={[{ len: 10, message: "เบอร์โทรศัพท์ต้องมี 10 หลัก" }]}
            >
              <Input
                type="tel"
                inputMode="numeric" // บังคับแป้นพิมพ์มือถือเป็นตัวเลข
                maxLength={10} // จำกัดความยาวสูงสุด 10 ตัวอักษร
                placeholder="กรอกเบอร์โทรศัพท์"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="allergies" label="ประวัติแพ้ยา/อาหาร">
              <Input
                style={{ color: "red" }}
                placeholder="กรอกประวัติแพ้ยา/อาหาร"
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="address"
              label="ที่อยู่จริง"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={2} placeholder="กรอกที่อยู่" />
              {/* ที่อยู่ควรใช้ TextArea ให้แสดงครบ */}
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* --- ส่วนที่ 3: ประวัติและสัญญาณชีพ --- */}
      <Card title="ประวัติและสัญญาณชีพ " className="mb-4" size="small">
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="admissionDate" label="วันที่เข้ารับการรักษา">
              <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item name="dischargeDate" label="วันที่จำหน่าย">
              <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={0} sm={0} md={12}>
            {/* Spacer for Desktop only */}
          </Col>

          <Col span={24}>
            <Divider
              orientation="left"
              style={{ margin: "10px 0", fontSize: "14px" }}
            >
              สัญญาณชีพ
            </Divider>
          </Col>

          {/* Vital Signs: มือถือให้เรียงแถวละ 2 ช่อง (xs={12}) */}
          <Col xs={12} sm={8} md={4}>
            <Form.Item name="temperature" label="Temp (C)">
              <InputNumber
                style={{ width: "100%" }}
                step={0.1}
                placeholder="ระบุอุณหภูมิ"
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Form.Item name="pulseRate" label="PR (bpm)">
              <InputNumber
                style={{ width: "100%" }}
                placeholder="ระบุอัตราการเต้นหัวใจ"
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Form.Item name="respRate" label="RR (/min)">
              <InputNumber
                style={{ width: "100%" }}
                placeholder="ระบุอัตราการหายใจ"
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Form.Item name="bloodPressure" label="BP (mmHg)">
              <Input placeholder="120/80" />
            </Form.Item>
          </Col>
          <Col xs={12} sm={12} md={4}>
            <Form.Item name="oxygenSat" label="O2 Sat (%)">
              <InputNumber
                style={{ width: "100%" }}
                max={100}
                placeholder="ระบุระดับออกซิเจนในเลือด"
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item name="initialHistory" label="ประวัติการเจ็บป่วยแรกรับ">
              <TextArea rows={2} placeholder="ระบุประวัติการเจ็บป่วยแรกรับ" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* --- ส่วนที่ 4: การประเมินและการดูแล --- */}
      <Card title="การประเมินและการดูแล" className="mb-4" size="small">
        <Row gutter={[16, 0]}>
          <Col xs={24}>
            <Form.Item name="symptoms" label="อาการปัจจุบัน">
              <TextArea rows={2} placeholder="ระบุอาการปัจจุบัน" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="diagnosis" label="การวินิจฉัยโรค">
              <TextArea rows={2} placeholder="ระบุการวินิจฉัยโรค" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="medication" label="ยากลับบ้าน">
              <TextArea rows={3} placeholder="รายการยา..." />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="medicalEquipment" label="อุปกรณ์ติดตัว">
              <TextArea rows={3} placeholder="เช่น สายสวนปัสสาวะ..." />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item name="careNeeds" label="ความต้องการในการดูแล">
              <TextArea rows={3} placeholder="ระบุปัญหาที่พบ..." />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* --- ส่วนที่ 5: การนัดหมาย --- */}
      <Card title="การนัดหมายและบันทึก" className="mb-4" size="small">
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="visitDate"
              label="วันที่เยี่ยมบ้าน"
              rules={[{ required: true }]}
            >
              <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="nextAppointment" label="นัดครั้งถัดไป">
              <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item name="notes" label="หมายเหตุเพิ่มเติม">
              <Input placeholder="ระบุหมายเหตุเพิ่มเติม" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Form.Item
        className="submit-button-item"
        style={{ textAlign: "center", marginTop: 20, paddingBottom: 20 }}
      >
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          style={{
            width: "100%",
            maxWidth: "300px",
            height: "50px",
            fontSize: "16px",
          }}
        >
          บันทึกข้อมูล
        </Button>
      </Form.Item>
    </Form>
  );
}
