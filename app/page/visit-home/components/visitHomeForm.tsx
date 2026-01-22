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
  Space,
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

  /*  ----------------------------------------- ข้อมูลตัวอย่าง/------------------------------------------ */
  // --- Helper Functions ---
  const getRandomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const getRandomElement = (arr: any[]) =>
    arr[Math.floor(Math.random() * arr.length)];

  // ✅ ฟังก์ชันสุ่มข้อมูลใส่ฟอร์ม HHC
  const handleAutoFill = () => {
    // 1. เตรียมชุดข้อมูลตัวอย่าง
    const firstNames = [
      "สมชาย",
      "วิชัย",
      "ธนพล",
      "สมศรี",
      "มารี",
      "กานดา",
      "ประวิทย์",
    ];
    const lastNames = [
      "ใจดี",
      "รักชาติ",
      "มีสุข",
      "มั่นคง",
      "เจริญพร",
      "สุขสันต์",
    ];
    const symptoms = [
      "อ่อนเพลีย",
      "หายใจลำบาก",
      "ปวดศีรษะ",
      "แผลกดทับระดับ 1",
      "ทานอาหารได้น้อย",
    ];
    const diagnoses = [
      "Stroke (โรคหลอดเลือดสมอง)",
      "DM (เบาหวาน)",
      "HT (ความดันโลหิตสูง)",
      "COPD (ปอดอุดกั้นเรื้อรัง)",
      "Bedridden (ผู้ป่วยติดเตียง)",
    ];
    const meds = [
      "Paracetamol 500mg",
      "Metformin 500mg",
      "Amlodipine 5mg",
      "Omeprazole 20mg",
      "Simvastatin 20mg",
    ];
    const equipments = [
      "สายสวนปัสสาวะ (Foley Cath)",
      "สายให้อาหาร (NG Tube)",
      "เครื่องผลิตออกซิเจน",
      "ที่นอนลม",
      "-",
    ];
    const needs = [
      "ทำแผลกดทับ",
      "เปลี่ยนสายสวนปัสสาวะ",
      "ติดตามระดับน้ำตาล",
      "กายภาพบำบัด",
      "แนะนำโภชนาการ",
    ];
    const addresses = [
      "123 ม.1 ต.วังเจ้า",
      "45/2 ม.3 ต.เชียงทอง",
      "88 หมู่บ้านสุขใจ",
      "หอพักแพทย์ รพ.สต.",
    ];

    // 2. สุ่มตัวเลขและข้อมูลพื้นฐาน
    const randAge = getRandomInt(40, 90);
    const randHN = getRandomInt(100000, 999999).toString();
    const randCID = Array(13)
      .fill(0)
      .map(() => getRandomInt(0, 9))
      .join(""); // 13 หลัก
    const randPhone =
      "08" +
      Array(8)
        .fill(0)
        .map(() => getRandomInt(0, 9))
        .join(""); // 10 หลัก

    // 3. สุ่มวันที่ (ให้มีความสัมพันธ์กัน: เกิด -> แอดมิท -> ออก -> เยี่ยม)
    const dobDate = dayjs().subtract(randAge, "year");
    const admitDate = dayjs().subtract(getRandomInt(5, 10), "day");
    const dischargeDate = dayjs().subtract(getRandomInt(1, 4), "day"); // ออกจาก รพ. 1-4 วันที่แล้ว
    const visitDate = dayjs(); // วันนี้
    const nextAppt = dayjs().add(getRandomInt(7, 30), "day"); // นัดครั้งหน้า

    // 4. สุ่ม Vital Signs
    const sys = getRandomInt(110, 150);
    const dia = getRandomInt(70, 90);
    const bp = `${sys}/${dia}`;

    // 5. สุ่มประเภทผู้ป่วย (เช็คก่อนว่ามี masterPatients ไหม)
    let randPatientTypeId = undefined;
    if (masterPatients && masterPatients.length > 0) {
      randPatientTypeId = getRandomElement(masterPatients).id;
    }

    // ✅ Set ค่าเข้าฟอร์ม
    form.setFieldsValue({
      hhcNo: `HHC-${dayjs().format("YY")}-${getRandomInt(100, 999)}`,
      referralDate: dayjs(), // วันที่ส่งต่อ (วันนี้)
      patientTypeId: randPatientTypeId,
      fullName: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
      age: randAge,
      hn: randHN,
      dob: dobDate,
      cid: randCID,
      phone: randPhone,
      allergies: Math.random() > 0.8 ? "แพ้กุ้ง, Penicillin" : "-", // มีโอกาสแพ้ 20%
      address: getRandomElement(addresses),

      // ประวัติ & VS
      admissionDate: admitDate,
      dischargeDate: dischargeDate,
      temperature: parseFloat((36 + Math.random()).toFixed(1)), // 36.0 - 37.0
      pulseRate: getRandomInt(60, 100),
      respRate: getRandomInt(16, 24),
      bloodPressure: bp,
      oxygenSat: getRandomInt(95, 100),
      initialHistory:
        "ผู้ป่วยมีอาการอ่อนแรงซีกซ้าย พูดไม่ชัด เข้ารับการรักษาที่ รพ.จังหวัด",

      // การดูแล
      symptoms: getRandomElement(symptoms),
      diagnosis: getRandomElement(diagnoses),
      medication: getRandomElement(meds) + ", " + getRandomElement(meds),
      medicalEquipment: getRandomElement(equipments),
      careNeeds: getRandomElement(needs),

      // นัดหมาย
      visitDate: visitDate,
      nextAppointment: nextAppt,
      notes: Math.random() > 0.5 ? "ทดสอบระบบ Auto-fill HHC" : "",
    });
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleFinish}>
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "20px", // ขนาดฟอนต์ยืดหยุ่นตามหน้าจอ
          marginBottom: 16,
          color: "#0683e9",
          marginTop: -8,
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
        <Space size="middle" wrap>
          {/* ปุ่มบันทึก */}
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{
              minWidth: "150px",
              height: "50px",
              fontSize: "16px",
            }}
          >
            บันทึกข้อมูล
          </Button>

          {/* ✅ ปุ่มสุ่มข้อมูลตัวอย่าง (เพิ่มใหม่) */}
          <Button
            htmlType="button" // ต้องใส่ htmlType="button" เพื่อกัน Submit
            onClick={handleAutoFill}
            size="large"
            style={{
              minWidth: "150px",
              height: "50px",
              fontSize: "16px",
            }}
          >
            สุ่มข้อมูลตัวอย่าง
          </Button>
        </Space>
      </Form.Item>

    </Form>
  );
}
