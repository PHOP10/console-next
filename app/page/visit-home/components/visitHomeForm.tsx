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
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { visitHomeServices } from "../services/visitHome.service";
import dayjs from "dayjs";
import { MasterPatientType } from "../../common";
import CryptoJS from "crypto-js";
import th_TH from "antd/locale/th_TH";
import {
  SaveOutlined,
  UserOutlined,
  HeartOutlined,
  FileTextOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

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

  // --- Master Template Styles (Premium Look) ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  // Header ของแต่ละ Section
  const SectionHeader = ({ icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 text-[#0683e9] font-bold text-lg mb-4 mt-2 border-b border-blue-50 pb-2">
      {icon} {title}
    </div>
  );

  return (
    <ConfigProvider locale={th_TH}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex justify-center">
        {/* Paper Container: กระดาษแผ่นเดียว สีขาวนวล เงานุ่ม */}
        <div className="bg-white w-full max-w-6xl shadow-xl rounded-3xl md:p-10 border border-white">
          <div className="text-center mb-4 -mt-2">
            <h1 className="text-2xl md:text-xl font-bold text-[#0683e9] mb-0">
              แบบบันทึกการดูแลต่อเนื่องที่บ้าน
            </h1>
          </div>

          <Form layout="vertical" form={form} onFinish={handleFinish}>
            {/* ---------------- Section 1: ข้อมูลผู้ป่วย ---------------- */}
            <SectionHeader
              icon={<UserOutlined />}
              title="ข้อมูลทั่วไปผู้ป่วย"
            />

            {/* Grid 4 Columns System */}
            <Row gutter={[20, 12]}>
              <Col xs={24} md={6}>
                <Form.Item name="hhcNo" label="เลขที่ HHC">
                  <Input className={inputStyle} placeholder="ระบุเลขที่" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="referralDate" label="วันที่ส่ง">
                  <DatePicker
                    format="DD/MM/YYYY"
                    className={`${inputStyle} pt-2`}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="patientTypeId"
                  label="ประเภทผู้ป่วย"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="เลือกประเภท" className={selectStyle}>
                    {masterPatients.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.typeName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* บรรทัด 2 */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="fullName"
                  label="ชื่อ-นามสกุล"
                  rules={[{ required: true }]}
                >
                  <Input
                    className={inputStyle}
                    placeholder="ชื่อ-สกุล ผู้ป่วย"
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item name="age" label="อายุ (ปี)">
                  <InputNumber
                    className={`${inputStyle} pt-1`}
                    style={{ width: "100%" }}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={8}>
                <Form.Item
                  name="cid"
                  label="เลขบัตรประชาชน"
                  rules={[{ required: true }]}
                >
                  <Input
                    maxLength={13}
                    className={inputStyle}
                    placeholder="13 หลัก"
                  />
                </Form.Item>
              </Col>

              {/* บรรทัด 3 */}
              <Col xs={24} md={6}>
                <Form.Item name="hn" label="HN">
                  <Input className={inputStyle} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="dob" label="วันเกิด">
                  <DatePicker
                    format="DD/MM/YYYY"
                    className={`${inputStyle} pt-2`}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="phone" label="เบอร์โทรศัพท์">
                  <Input
                    maxLength={10}
                    className={inputStyle}
                    placeholder="08x-xxx-xxxx"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="allergies" label="แพ้ยา/อาหาร">
                  <Input
                    className={`${inputStyle} text-red-600 font-medium bg-red-50 border-red-200`}
                    placeholder="ระบุ (ถ้ามี)"
                  />
                </Form.Item>
              </Col>

              {/* ที่อยู่ เต็มแถว */}
              <Col span={24}>
                <Form.Item
                  name="address"
                  label="ที่อยู่ปัจจุบัน"
                  rules={[{ required: true }]}
                >
                  <Input
                    className={inputStyle}
                    placeholder="บ้านเลขที่ หมู่ ซอย ถนน ตำบล อำเภอ จังหวัด"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider className="my-6 border-gray-100" />

            {/* ---------------- Section 2: ประวัติ & สัญญาณชีพ ---------------- */}
            <SectionHeader
              icon={<HeartOutlined />}
              title="ประวัติและสัญญาณชีพ"
            />

            <Row gutter={[20, 12]}>
              <Col xs={12} md={6}>
                <Form.Item name="admissionDate" label="วันที่รับรักษา">
                  <DatePicker
                    format="DD/MM/YYYY"
                    className={`${inputStyle} pt-2`}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="dischargeDate" label="วันที่จำหน่าย">
                  <DatePicker
                    format="DD/MM/YYYY"
                    className={`${inputStyle} pt-2`}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="initialHistory"
                  label="ประวัติการเจ็บป่วยแรกรับ"
                >
                  <Input
                    className={inputStyle}
                    placeholder="ระบุประวัติพอสังเขป"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Vital Signs Bar - แถบสีพื้นหลังเพื่อให้ดูเป็นกลุ่มก้อนเดียวกัน */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mt-2 mb-4">
              <Row gutter={[16, 12]} align="middle">
                <Col xs={24} md={2}>
                  <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">
                    Vital Signs
                  </span>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Form.Item
                    name="temperature"
                    label="Temp (°C)"
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      className={`${inputStyle} pt-1 bg-white`}
                      style={{ width: "100%" }}
                      step={0.1}
                      placeholder="37.0"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Form.Item
                    name="pulseRate"
                    label="Pulse (bpm)"
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      className={`${inputStyle} pt-1 bg-white`}
                      style={{ width: "100%" }}
                      placeholder="80"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Form.Item
                    name="respRate"
                    label="Resp (/min)"
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      className={`${inputStyle} pt-1 bg-white`}
                      style={{ width: "100%" }}
                      placeholder="20"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6} md={6}>
                  <Form.Item
                    name="bloodPressure"
                    label="BP (mmHg)"
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      className={`${inputStyle} bg-white`}
                      placeholder="120/80"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6} md={4}>
                  <Form.Item
                    name="oxygenSat"
                    label="O2 Sat (%)"
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      className={`${inputStyle} pt-1 bg-white`}
                      style={{ width: "100%" }}
                      placeholder="99"
                      max={100}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider className="my-6 border-gray-100" />

            {/* ---------------- Section 3: Layout 2 คอลัมน์ (ประหยัดที่แนวตั้ง) ---------------- */}
            <Row gutter={48}>
              {/* คอลัมน์ซ้าย: การประเมิน */}
              <Col xs={24} lg={12}>
                <SectionHeader
                  icon={<FileTextOutlined />}
                  title="การประเมินอาการ"
                />
                <Form.Item name="symptoms" label="อาการปัจจุบัน">
                  <TextArea
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    className={textAreaStyle}
                    placeholder="ระบุอาการ..."
                  />
                </Form.Item>
                <Form.Item name="diagnosis" label="การวินิจฉัยโรค">
                  <TextArea
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    className={textAreaStyle}
                    placeholder="ระบุการวินิจฉัย..."
                  />
                </Form.Item>
                <Form.Item name="careNeeds" label="ปัญหา/ความต้องการดูแล">
                  <TextArea
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    className={textAreaStyle}
                    placeholder="ระบุปัญหา..."
                  />
                </Form.Item>
              </Col>

              {/* คอลัมน์ขวา: การรักษา (มีเส้นแบ่งบนจอใหญ่) */}
              <Col
                xs={24}
                lg={12}
                className="lg:border-l lg:border-gray-100 lg:pl-12"
              >
                <SectionHeader
                  icon={<MedicineBoxOutlined />}
                  title="การรักษาและอุปกรณ์"
                />
                <Form.Item name="medication" label="รายการยา">
                  <TextArea
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    className={textAreaStyle}
                    placeholder="รายการยา..."
                  />
                </Form.Item>
                <Form.Item name="medicalEquipment" label="อุปกรณ์ติดตัว">
                  <TextArea
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    className={textAreaStyle}
                    placeholder="เช่น สายสวนปัสสาวะ, NG Tube..."
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider className="my-6 border-gray-100" />

            {/* ---------------- Section 4: นัดหมาย (Footer Bar) ---------------- */}
            <div className="bg-blue-50/30 rounded-2xl p-6 border border-blue-100">
              <SectionHeader icon={<CalendarOutlined />} title="การนัดหมาย" />
              <Row gutter={[20, 12]} align="bottom">
                <Col xs={12} md={6}>
                  <Form.Item
                    name="visitDate"
                    label="วันที่เยี่ยมบ้าน"
                    rules={[{ required: true }]}
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      className={`${inputStyle} pt-2`}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="nextAppointment" label="นัดครั้งถัดไป">
                    <DatePicker
                      format="DD/MM/YYYY"
                      className={`${inputStyle} pt-2`}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="notes" label="หมายเหตุ">
                    <Input
                      className={inputStyle}
                      placeholder="ระบุเพิ่มเติม..."
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Submit Button Area */}
            <div className="mt-8 flex justify-center">
              <Button
                type="primary"
                htmlType="submit"
                className="h-9 px-6 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[#0683e9] to-[#2593fc] border-0"
              >
                บันทึกข้อมูลการเยี่ยมบ้าน
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
}
