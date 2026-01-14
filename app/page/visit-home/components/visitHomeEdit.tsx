"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Tag,
  message,
  InputNumber,
  Divider,
  Button, // import Button
  Card,
} from "antd";
import dayjs from "dayjs";
import CryptoJS from "crypto-js";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { visitHomeServices } from "../services/visitHome.service";
import { VisitHomeType, MasterPatientType } from "../../common";

const { Option } = Select;
const { TextArea } = Input;

const SECRET_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "MY_SUPER_SECRET_KEY_1234";

interface VisitHomeEditProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  record: VisitHomeType | null;
  masterPatients: MasterPatientType[];
  initialMode: "view" | "edit"; // รับค่า mode มา
}

export default function VisitHomeEdit({
  visible,
  onCancel,
  onSuccess,
  record,
  masterPatients,
  initialMode,
}: VisitHomeEditProps) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = visitHomeServices(intraAuth);
  const [mode, setMode] = useState<"view" | "edit">(initialMode);

  // ฟังก์ชันถอดรหัส (สำหรับแสดงในฟอร์ม)
  const decryptData = (ciphertext: string | null | undefined) => {
    if (!ciphertext) return "";
    if (!ciphertext.toString().startsWith("U2F")) return ciphertext;
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8) || ciphertext;
    } catch (e) {
      return ciphertext;
    }
  };

  useEffect(() => {
    if (visible) {
      setMode(initialMode);
    }
  }, [visible, initialMode]);

  // ฟังก์ชันเข้ารหัส (สำหรับส่งไป API)
  const encryptData = (text: string) => {
    if (!text) return null;
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  };

  // เมื่อเปิด Modal หรือเปลี่ยน Record ให้ดึงข้อมูลมาใส่ฟอร์ม
  useEffect(() => {
    if (visible && record) {
      // 1. ถอดรหัสข้อมูลส่วนบุคคล
      const decryptedFirstName = decryptData(record.firstName);
      const decryptedLastName = decryptData(record.lastName);
      const decryptedFullName = decryptData(record.fullName); // ถ้ามีเก็บไว้

      // ถ้าไม่มี fullName ใน DB ให้เอา firstName + lastName มาต่อกัน
      const displayFullName =
        decryptedFullName ||
        `${decryptedFirstName} ${decryptedLastName}`.trim();

      const initialValues = {
        ...record,
        // --- ข้อมูลที่ต้องถอดรหัส ---
        fullName: displayFullName,
        address: decryptData(record.address),
        hn: decryptData(record.hn),
        cid: decryptData(record.cid),
        phone: decryptData(record.phone),

        // --- แปลงวันที่ ---
        visitDate: record.visitDate ? dayjs(record.visitDate) : null,
        referralDate: record.referralDate ? dayjs(record.referralDate) : null,
        dob: record.dob ? dayjs(record.dob) : null,
        admissionDate: record.admissionDate
          ? dayjs(record.admissionDate)
          : null,
        dischargeDate: record.dischargeDate
          ? dayjs(record.dischargeDate)
          : null,
        nextAppointment: record.nextAppointment
          ? dayjs(record.nextAppointment)
          : null,

        // --- ID Relation ---
        patientTypeId: record.patientType?.id || null,
      };

      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [visible, record, form]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

      if (!record) return;

      // แยกชื่อ-นามสกุล จาก fullName
      const fullNameStr = values.fullName || "";
      const nameParts = fullNameStr.trim().split(/\s+/);
      const firstNameRaw = nameParts[0] || "-";
      const lastNameRaw = nameParts.slice(1).join(" ") || "-";

      const payload = {
        id: record.id,

        // --- ข้อมูลทั่วไป (ส่งปกติ) ---
        patientTypeId: values.patientTypeId || null,
        age: values.age ? Number(values.age) : null,
        hhcNo: values.hhcNo || null,
        allergies: values.allergies || null,

        // --- วันที่ (แปลงเป็น ISO String) ---
        visitDate: values.visitDate ? values.visitDate.toISOString() : null,
        referralDate: values.referralDate
          ? values.referralDate.toISOString()
          : null,
        dob: values.dob ? values.dob.toISOString() : null,
        admissionDate: values.admissionDate
          ? values.admissionDate.toISOString()
          : null,
        dischargeDate: values.dischargeDate
          ? values.dischargeDate.toISOString()
          : null,
        nextAppointment: values.nextAppointment
          ? values.nextAppointment.toISOString()
          : null,

        // --- สัญญาณชีพ (แปลงเป็น Number) ---
        temperature: values.temperature ? Number(values.temperature) : null,
        pulseRate: values.pulseRate ? Number(values.pulseRate) : null,
        respRate: values.respRate ? Number(values.respRate) : null,
        oxygenSat: values.oxygenSat ? Number(values.oxygenSat) : null,
        bloodPressure: values.bloodPressure || null,

        // --- ข้อมูลอาการ/การรักษา ---
        initialHistory: values.initialHistory || null,
        symptoms: values.symptoms || null,
        diagnosis: values.diagnosis || null,
        medication: values.medication || null,
        medicalEquipment: values.medicalEquipment || null,
        careNeeds: values.careNeeds || null,
        notes: values.notes || null,

        // --- ข้อมูลส่วนบุคคล (เข้ารหัส) ---
        firstName: encryptData(firstNameRaw),
        lastName: encryptData(lastNameRaw),
        fullName: encryptData(fullNameStr),
        address: encryptData(values.address),
        hn: encryptData(values.hn),
        cid: encryptData(values.cid),
        phone: encryptData(values.phone),
      };

      const res = await intraAuthService.updateVisitHome(payload);

      if (res) {
        message.success("แก้ไขข้อมูลสำเร็จ");
        onSuccess();
      }
    } catch (error) {
      console.error("Update Error:", error);
      message.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    }
  };

  return (
    <Modal
      title={
        mode === "view" ? "รายละเอียดการเยี่ยมบ้าน" : "แก้ไขข้อมูลการเยี่ยมบ้าน"
      }
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      width={1000}
      maskClosable={true}
      style={{ top: 20 }}
      // --- ปรับแต่งปุ่มด้านล่าง (Footer) ---
      footer={[
        // ปุ่มซ้ายสุด: ถ้าดูอยู่ ให้เป็นปุ่ม "ปิด", ถ้าแก้อยู่ ให้เป็น "ยกเลิก"
        <Button key="back" onClick={onCancel}>
          {mode === "view" ? "ปิดหน้าต่าง" : "ยกเลิก"}
        </Button>,

        // ปุ่มขวาสุด:
        mode === "view" ? (
          <Button
            key="edit"
            type="primary"
            onClick={() => setMode("edit")} // กดแล้วเปลี่ยนเป็นโหมดแก้ไข
          >
            แก้ไขข้อมูล
          </Button>
        ) : (
          <Button
            key="submit"
            type="primary"
            onClick={handleUpdate} // กดแล้วบันทึก
          >
            บันทึกการแก้ไข
          </Button>
        ),
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 20 }}
        disabled={mode === "view"}
      >
        {/* --- ส่วนที่ 1: ข้อมูลผู้ป่วย --- */}
        <Card title="ข้อมูลผู้ป่วย" className="mb-4" size="small">
          <Row gutter={[16, 0]}>
            {/* <Col span={24}>
              <Tag
                color="blue"
                style={{
                  marginBottom: 15,
                  fontSize: "14px",
                  padding: "5px 10px",
                }}
              >
                ข้อมูลทั่วไปและผู้ป่วย
              </Tag>
            </Col> */}

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
                label="ชื่อ-นามสกุล"
                rules={[{ required: true, message: "กรุณากรอกชื่อ-นามสกุล" }]}
              >
                <Input placeholder="ระบุชื่อ เว้นวรรค นามสกุล" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Form.Item
                name="age"
                label="อายุ (ปี)"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Form.Item name="hn" label="HN">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item name="dob" label="วันเดือนปีเกิด">
                <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="cid"
                label="เลขบัตรประชาชน"
                normalize={(value) => (value || "").replace(/[^0-9]/g, "")}
              >
                <Input maxLength={13} placeholder="13 หลัก" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="phone"
                label="เบอร์โทรศัพท์"
                normalize={(value) => (value || "").replace(/[^0-9]/g, "")}
              >
                <Input maxLength={10} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="allergies" label="ประวัติแพ้ยา/อาหาร">
                <Input style={{ color: "red" }} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="address"
                label="ที่อยู่"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Divider />
        <Card title="ประวัติและสัญญาณชีพ " className="mb-4" size="small">
          {/* --- ส่วนที่ 2: ประวัติและสัญญาณชีพ --- */}
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
            <Col xs={0} sm={0} md={12}></Col>

            <Col xs={12} sm={8} md={4}>
              <Form.Item name="temperature" label="Temp (C)">
                <InputNumber style={{ width: "100%" }} step={0.1} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Form.Item name="pulseRate" label="PR (bpm)">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Form.Item name="respRate" label="RR (/min)">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Form.Item name="bloodPressure" label="BP (mmHg)">
                <Input placeholder="120/80" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={12} md={4}>
              <Form.Item name="oxygenSat" label="O2 Sat (%)">
                <InputNumber style={{ width: "100%" }} max={100} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="initialHistory" label="ประวัติการเจ็บป่วยแรกรับ">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <Divider />
        <Card title="การประเมินและการดูแล" className="mb-4" size="small">
          {/* --- ส่วนที่ 3: การดูแลและการนัดหมาย --- */}
          <Row gutter={[16, 0]}>
            <Col xs={24}>
              <Form.Item name="symptoms" label="อาการปัจจุบัน">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="diagnosis" label="การวินิจฉัยโรค">
                <TextArea rows={2} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="medication" label="ยากลับบ้าน">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="medicalEquipment" label="อุปกรณ์ติดตัว">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="careNeeds" label="ความต้องการในการดูแล">
                <TextArea rows={2} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="วันที่เยี่ยม"
                name="visitDate"
                rules={[{ required: true }]}
              >
                <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="นัดถัดไป" name="nextAppointment">
                <DatePicker format="DD-MM-YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Form.Item label="หมายเหตุ" name="notes">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
}
