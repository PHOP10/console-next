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
  ConfigProvider,
  Divider,
  Card,
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { visitHomeServices } from "../services/visitHome.service";
import dayjs from "dayjs";
import { MasterPatientType } from "../../common";
import CryptoJS from "crypto-js";
import th_TH from "antd/locale/th_TH";
import {
  UserOutlined,
  HeartOutlined,
  FileTextOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import "./Form.css";
import { buddhistLocale } from "@/app/common";
import "dayjs/locale/th";
import { useRouter } from "next/navigation";

const { Option } = Select;
const { TextArea } = Input;

const SECRET_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "MY_SUPER_SECRET_KEY_1234";

export default function VisitHomeForm() {
  const [form] = Form.useForm();
  const [masterPatients, setMasterPatients] = useState<MasterPatientType[]>([]);
  const intraAuth = useAxiosAuth();
  const intraAuthService = visitHomeServices(intraAuth);
  const router = useRouter();

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
      const fullNameStr = values.fullName || "";
      const nameParts = fullNameStr.trim().split(/\s+/);
      const firstNameRaw = nameParts[0] || "";
      const lastNameRaw = nameParts.slice(1).join(" ") || "";

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
        hhcNo: encryptData(values.hhcNo),
        firstName: encryptData(firstNameRaw),
        lastName: encryptData(lastNameRaw),
        fullName: encryptData(fullNameStr),
        hn: encryptData(values.hn),
        cid: encryptData(values.cid),
        phone: encryptData(values.phone),
        address: encryptData(values.address),
        bloodPressure: encryptData(values.bloodPressure),
        allergies: encryptData(values.allergies),
        initialHistory: encryptData(values.initialHistory),
        symptoms: encryptData(values.symptoms),
        diagnosis: encryptData(values.diagnosis),
        medication: encryptData(values.medication),
        medicalEquipment: encryptData(values.medicalEquipment),
        careNeeds: encryptData(values.careNeeds),
        notes: encryptData(values.notes),
      };

      await intraAuthService.createVisitHomeWaste(payload);
      message.success("บันทึกข้อมูลสำเร็จ");
      form.resetFields();
      router.push("/page/visit-home/dataVisitHome");
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
  };

  // --- Style Constants (Compact Mode) ---
  // ปรับ h-11 เป็น h-9 สำหรับมือถือ (36px) เพื่อประหยัดที่
  const inputStyle =
    "w-full h-9 sm:h-10 rounded-lg border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-xs sm:text-sm px-2";

  const textAreaStyle =
    "w-full rounded-lg border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-xs sm:text-sm px-2 py-1";

  const selectStyle =
    "h-9 sm:h-10 w-full [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400 text-xs sm:text-sm";

  // ลด margin-bottom ของ header
  const SectionHeader = ({ icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 text-[#0683e9] font-bold text-base sm:text-lg mb-2 mt-0 border-b border-blue-50 pb-1">
      {React.cloneElement(icon, { style: { fontSize: "18px" } })} {title}
    </div>
  );

  return (
    <Card bodyStyle={{ padding: "12px" }}>
      {" "}
      {/* ลด padding card */}
      <ConfigProvider locale={th_TH}>
        <div className="rounded-xl shadow-sm mx-auto max-w-7xl overflow-hidden">
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            {/* --- ข้อมูลทั่วไป --- */}
            <SectionHeader icon={<UserOutlined />} title="ข้อมูลทั่วไป" />

            {/* Grid แน่นพิเศษ Gutter แค่ 8px บนมือถือ */}
            <Row
              gutter={[
                { xs: 8, sm: 16 },
                { xs: 4, sm: 12 },
              ]}
            >
              {/* แถว 1: HHC (1/2) | วันที่ส่ง (1/2) */}
              <Col xs={12} md={6}>
                <Form.Item name="hhcNo" label="เลขที่ HHC" className="mb-1">
                  <Input
                    className={inputStyle}
                    placeholder="เลขที่"
                    maxLength={10}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item
                  name="referralDate"
                  label="วันที่ส่ง"
                  className="mb-1"
                >
                  <DatePicker
                    locale={buddhistLocale}
                    format="D MMM BB"
                    className={`${inputStyle} w-full font-normal`}
                    style={{ width: "100%" }}
                    placeholder="วว/ดด/ปป"
                  />
                </Form.Item>
              </Col>

              {/* แถว 2: ประเภท (2/3) | อายุ (1/3) */}
              <Col xs={16} md={8}>
                <Form.Item
                  name="patientTypeId"
                  label="ประเภทผู้ป่วย"
                  rules={[{ required: true }]}
                  className="mb-1"
                >
                  <Select placeholder="เลือก" className={selectStyle}>
                    {masterPatients.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.typeName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={8} md={4}>
                <Form.Item name="age" label="อายุ(ปี)" className="mb-1">
                  <InputNumber
                    className={`${inputStyle} pt-1 text-center`}
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>

              {/* แถว 3: ชื่อ-สกุล (เต็ม) */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="fullName"
                  label="ชื่อ-นามสกุล"
                  rules={[{ required: true }]}
                  className="mb-1"
                >
                  <Input
                    className={inputStyle}
                    placeholder="ชื่อ-สกุล ผู้ป่วย"
                    maxLength={100}
                  />
                </Form.Item>
              </Col>

              {/* แถว 4: บัตร (14/24) | HN (10/24) */}
              <Col xs={14} md={8}>
                <Form.Item
                  name="cid"
                  label="เลขบัตร ปชช."
                  className="mb-1"
                  rules={[{ required: true }]}
                  normalize={(value) => (value || "").replace(/[^0-9]/g, "")}
                >
                  <Input
                    maxLength={13}
                    className={inputStyle}
                    placeholder="13 หลัก"
                    inputMode="numeric"
                  />
                </Form.Item>
              </Col>
              <Col xs={10} md={6}>
                <Form.Item name="hn" label="HN" className="mb-1">
                  <Input className={inputStyle} placeholder="HN" />
                </Form.Item>
              </Col>

              {/* แถว 5: วันเกิด (1/2) | เบอร์โทร (1/2) */}
              <Col xs={12} md={6}>
                <Form.Item name="dob" label="วันเกิด" className="mb-1">
                  <DatePicker
                    locale={buddhistLocale}
                    format="D MMM BB"
                    className={`${inputStyle} w-full font-normal`}
                    style={{ width: "100%" }}
                    placeholder="วว/ดด/ปป"
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item
                  name="phone"
                  label="เบอร์โทร"
                  className="mb-1"
                  normalize={(value) => (value || "").replace(/[^0-9]/g, "")}
                >
                  <Input
                    maxLength={10}
                    className={inputStyle}
                    placeholder="08x..."
                    inputMode="numeric"
                  />
                </Form.Item>
              </Col>

              {/* แถว 6: แพ้ยา (เต็ม) | ที่อยู่ (เต็ม) */}
              <Col xs={24} md={6}>
                <Form.Item
                  name="allergies"
                  label="แพ้ยา/อาหาร"
                  className="mb-1"
                >
                  <Input
                    className={`${inputStyle} text-red-600 bg-red-50 border-red-200`}
                    placeholder="ระบุ (ถ้ามี)"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="address"
                  label="ที่อยู่ปัจจุบัน"
                  rules={[{ required: true }]}
                  className="mb-2"
                >
                  <Input
                    className={inputStyle}
                    placeholder="ที่อยู่"
                    maxLength={200}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider className="my-2 border-gray-100" />

            {/* --- สัญญาณชีพ --- */}
            <SectionHeader icon={<HeartOutlined />} title="ประวัติ/สัญญาณชีพ" />

            <Row
              gutter={[
                { xs: 8, sm: 16 },
                { xs: 4, sm: 12 },
              ]}
            >
              {/* วันที่รับ/จำหน่าย แบ่งครึ่ง */}
              <Col xs={12} md={6}>
                <Form.Item
                  name="admissionDate"
                  label="รับรักษา"
                  className="mb-1"
                >
                  <DatePicker
                    locale={buddhistLocale}
                    format="D MMM BB"
                    className={`${inputStyle} w-full font-normal`}
                    style={{ width: "100%" }}
                    placeholder="วว/ดด/ปป"
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item
                  name="dischargeDate"
                  label="จำหน่าย"
                  className="mb-1"
                >
                  <DatePicker
                    locale={buddhistLocale}
                    format="D MMM BB"
                    className={`${inputStyle} w-full font-normal`}
                    style={{ width: "100%" }}
                    placeholder="วว/ดด/ปป"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="initialHistory"
                  label="ประวัติแรกรับ"
                  className="mb-2"
                >
                  <Input
                    className={inputStyle}
                    placeholder="ประวัติพอสังเขป"
                    maxLength={80}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Vital Signs: อัดแน่น 3 ช่องต่อแถว */}
            <div className="bg-slate-50/50 rounded-lg p-2 border border-slate-100 mt-0 mb-2">
              <Row gutter={[8, 4]} align="middle">
                <Col xs={24} md={2} className="mb-1">
                  <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                    Vital Signs
                  </span>
                </Col>

                {/* 3 ช่องต่อแถว (xs=8) สำหรับตัวเลข */}
                <Col xs={8} sm={6} md={4}>
                  <Form.Item name="temperature" label="Temp" className="mb-0">
                    <InputNumber
                      className={`${inputStyle} pt-0.5 bg-white text-center`}
                      style={{ width: "100%" }}
                      step={0.1}
                      placeholder="°C"
                      max={100}
                      parser={(value: any) => value?.replace(/[^\d.]/g, "")}
                      onKeyPress={(event) => {
                        if (!/[0-9.]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      maxLength={2}
                    />
                  </Form.Item>
                </Col>
                <Col xs={8} sm={6} md={4}>
                  <Form.Item name="pulseRate" label="Pulse" className="mb-0">
                    <InputNumber
                      className={`${inputStyle} pt-0.5 bg-white text-center`}
                      style={{ width: "100%" }}
                      placeholder="bpm"
                      maxLength={5}
                    />
                  </Form.Item>
                </Col>
                <Col xs={8} sm={6} md={4}>
                  <Form.Item name="respRate" label="Resp" className="mb-0">
                    <InputNumber
                      className={`${inputStyle} pt-0.5 bg-white text-center`}
                      style={{ width: "100%" }}
                      placeholder="/min"
                      maxLength={5}
                    />
                  </Form.Item>
                </Col>

                {/* ความดัน 12 + O2 12 (แบ่งครึ่ง) */}
                <Col xs={12} sm={6} md={6}>
                  <Form.Item name="bloodPressure" label="BP" className="mb-0">
                    <Input
                      className={`${inputStyle} bg-white text-center`}
                      placeholder="120/80"
                      maxLength={5}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Form.Item name="oxygenSat" label="O2 (%)" className="mb-0">
                    <InputNumber
                      className={`${inputStyle} pt-0.5 bg-white text-center`}
                      style={{ width: "100%" }}
                      placeholder="%"
                      max={100}
                      maxLength={5}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider className="my-2 border-gray-100" />

            {/* --- อาการ / การรักษา (TextArea) --- */}
            <Row gutter={24}>
              <Col xs={24} lg={12}>
                <SectionHeader icon={<FileTextOutlined />} title="การประเมิน" />
                <Form.Item
                  name="symptoms"
                  label="อาการปัจจุบัน"
                  className="mb-1"
                >
                  <TextArea
                    autoSize={{ minRows: 1, maxRows: 3 }} // ลด minRows
                    className={textAreaStyle}
                    placeholder="อาการ..."
                    maxLength={200}
                  />
                </Form.Item>
                <Form.Item name="diagnosis" label="วินิจฉัย" className="mb-1">
                  <TextArea
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    className={textAreaStyle}
                    placeholder="วินิจฉัย..."
                    maxLength={200}
                  />
                </Form.Item>
                <Form.Item
                  name="careNeeds"
                  label="ความต้องการดูแล"
                  className="mb-2"
                >
                  <TextArea
                    autoSize={{ minRows: 1, maxRows: 3 }}
                    className={textAreaStyle}
                    placeholder="ปัญหา..."
                    maxLength={200}
                  />
                </Form.Item>
              </Col>

              <Col
                xs={24}
                lg={12}
                className="lg:border-l lg:border-gray-100 lg:pl-6"
              >
                <SectionHeader
                  icon={<MedicineBoxOutlined />}
                  title="รักษา/อุปกรณ์"
                />
                <Form.Item name="medication" label="ยา" className="mb-1">
                  <TextArea
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    className={textAreaStyle}
                    placeholder="รายการยา..."
                    maxLength={150}
                  />
                </Form.Item>
                <Form.Item
                  name="medicalEquipment"
                  label="อุปกรณ์"
                  className="mb-2"
                >
                  <TextArea
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    className={textAreaStyle}
                    placeholder="เช่น NG Tube..."
                    maxLength={150}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider className="my-2 border-gray-100" />

            {/* --- นัดหมาย --- */}
            <div className="bg-blue-50/30 rounded-lg p-3 border border-blue-100">
              <SectionHeader icon={<CalendarOutlined />} title="นัดหมาย" />
              <Row
                gutter={[
                  { xs: 8, sm: 16 },
                  { xs: 4, sm: 12 },
                ]}
                align="bottom"
              >
                {/* วันที่เยี่ยมบ้าน | วันนัดถัดไป แบ่งครึ่ง */}
                <Col xs={12} md={6}>
                  <Form.Item
                    name="visitDate"
                    label="วันเยี่ยม"
                    rules={[{ required: true }]}
                    className="mb-1"
                  >
                    <DatePicker
                      locale={buddhistLocale}
                      format="D MMM BB"
                      className={`${inputStyle} w-full font-normal`}
                      style={{ width: "100%" }}
                      placeholder="วว/ดด/ปป"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item
                    name="nextAppointment"
                    label="นัดถัดไป"
                    className="mb-1"
                  >
                    <DatePicker
                      locale={buddhistLocale}
                      format="D MMM BB"
                      className={`${inputStyle} w-full font-normal`}
                      style={{ width: "100%" }}
                      placeholder="วว/ดด/ปป"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item name="notes" label="หมายเหตุ" className="mb-1">
                    <Input
                      className={inputStyle}
                      placeholder="ระบุเพิ่มเติม..."
                      maxLength={70}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <div className="mt-4 flex justify-center">
              <Button
                type="primary"
                htmlType="submit"
                className="h-9 sm:h-10 px-6 rounded-lg text-xs sm:text-sm font-medium shadow-md bg-gradient-to-r from-[#0683e9] to-[#2593fc] border-0 w-full sm:w-auto"
              >
                บันทึกข้อมูล
              </Button>
            </div>
          </Form>
        </div>
      </ConfigProvider>
    </Card>
  );
}
