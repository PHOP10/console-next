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
  SaveOutlined,
  UserOutlined,
  HeartOutlined,
  FileTextOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import "./Form.css";
import { ExperimentOutlined } from "@ant-design/icons"; /* ตัวอย่างข้อมูล */

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

  // --------------------------------------------------------ข้อมูลตัวอย่าง---------------------------//
  const getRandomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const getRandomElement = (arr: any[]) =>
    arr[Math.floor(Math.random() * arr.length)];

  const handleAutoFill = () => {
    // A. ข้อมูลผู้ป่วย (Mock Data)
    const firstNames = ["สมชาย", "วิชัย", "กานดา", "มานี", "สมศรี", "อำนวย"];
    const lastNames = ["ใจดี", "รักชาติ", "มีสุข", "เจริญพร", "มั่นคง"];
    const addresses = [
      "123 ม.1 ต.เชียงทอง",
      "55 ม.4 ต.วังเจ้า",
      "88/9 ถ.พหลโยธิน",
    ];
    const diagnosisList = [
      "Stroke with Hemiparesis",
      "Diabetes Mellitus type 2",
      "Hypertension with complications",
      "COPD with acute exacerbation",
      "Bedridden patient",
    ];
    const symptomsList = [
      "มีอาการอ่อนแรงซีกซ้าย",
      "แผลกดทับที่ก้นกบ ระดับ 2",
      "หายใจเหนื่อยหอบเล็กน้อย",
      "รับประทานอาหารได้น้อยลง",
      "ระดับน้ำตาลในเลือดสูง",
    ];
    const medicationList = [
      "Metformin 500mg 1x3 pc",
      "Amlodipine 5mg 1x1 pc",
      "ASA 81mg 1x1 pc",
      "Omeprazole 20mg 1x2 ac",
    ];
    const equipmentList = [
      "Foley Catheter",
      "NG Tube",
      "Oxygen Cannula",
      "Wheelchair",
      "-",
    ];

    // B. สุ่มข้อมูลทั่วไป
    const randAge = getRandomInt(40, 90);
    const randCID = Array(13)
      .fill(0)
      .map(() => getRandomInt(0, 9))
      .join("");
    const randPhone =
      "08" +
      Array(8)
        .fill(0)
        .map(() => getRandomInt(0, 9))
        .join("");
    const randHN = getRandomInt(100000, 999999).toString();

    // C. สุ่มวันที่
    const today = dayjs();
    const admitDate = today.subtract(getRandomInt(5, 30), "day");
    const dischargeDate = admitDate.add(getRandomInt(3, 10), "day");
    const referralDate = today.subtract(getRandomInt(0, 5), "day");

    // D. สุ่มสัญญาณชีพ (Vital Signs) - ให้ค่าอยู่ในเกณฑ์ปกติถึงปานกลาง
    const temp = (getRandomInt(360, 375) / 10).toFixed(1); // 36.0 - 37.5
    const pulse = getRandomInt(70, 100);
    const resp = getRandomInt(18, 24);
    const bpSystolic = getRandomInt(110, 150);
    const bpDiastolic = getRandomInt(70, 90);
    const o2sat = getRandomInt(95, 100);

    // E. สุ่มประเภทผู้ป่วย (จาก Master Data ที่มี)
    let randPatientTypeId = undefined;
    if (masterPatients && masterPatients.length > 0) {
      randPatientTypeId = getRandomElement(masterPatients).id;
    }

    // ✅ F. ใส่ค่าลง Form
    form.setFieldsValue({
      // ข้อมูลทั่วไป
      hhcNo: `HHC-${getRandomInt(100, 999)}`,
      referralDate: referralDate,
      patientTypeId: randPatientTypeId,
      fullName: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
      age: randAge,
      cid: randCID,
      hn: randHN,
      dob: dayjs()
        .year(dayjs().year() - randAge)
        .startOf("year"), // วันเกิดคร่าวๆ ตามอายุ
      phone: randPhone,
      allergies: Math.random() > 0.8 ? "Penicillin" : "-", // สุ่มแพ้ยา 20%
      address: getRandomElement(addresses),

      // ประวัติ & Vital Signs
      admissionDate: admitDate,
      dischargeDate: dischargeDate,
      initialHistory: "ผู้ป่วยเข้ารับการรักษาด้วยอาการ...",
      temperature: temp,
      pulseRate: pulse,
      respRate: resp,
      bloodPressure: `${bpSystolic}/${bpDiastolic}`,
      oxygenSat: o2sat,

      // การประเมิน & รักษา
      symptoms: getRandomElement(symptomsList),
      diagnosis: getRandomElement(diagnosisList),
      careNeeds: "ต้องการการดูแลแผลและกายภาพบำบัด",
      medication: getRandomElement(medicationList),
      medicalEquipment: getRandomElement(equipmentList),

      // นัดหมาย
      visitDate: today,
      nextAppointment: today.add(getRandomInt(7, 30), "day"),
      notes: Math.random() > 0.5 ? "ทดสอบระบบ (Auto-fill)" : "",
    });
  };

  return (
    <Card>
      <ConfigProvider locale={th_TH}>
        <div className=" rounded-xl shadow-sm mx-auto max-w-7xl overflow-hidden">
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            <SectionHeader
              icon={<UserOutlined />}
              title="ข้อมูลทั่วไปผู้ป่วย"
            />

            <Row gutter={[20, 12]}>
              <Col xs={24} md={6}>
                <Form.Item name="hhcNo" label="เลขที่ HHC">
                  <Input className={inputStyle} placeholder="ระบุเลขที่" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="referralDate" label="วันที่ส่ง">
                  <DatePicker
                    format="DD MMMM YYYY"
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
                    format="DD MMMM YYYY"
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
                    format="DD MMMM YYYY"
                    className={`${inputStyle} pt-2`}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="dischargeDate" label="วันที่จำหน่าย">
                  <DatePicker
                    format="DD MMMM YYYY"
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

            {/* Vital Signs Bar */}
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

            {/* ---------------- Section 3: Layout 2 คอลัมน์ ---------------- */}
            <Row gutter={48}>
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

            {/* ---------------- Section 4: นัดหมาย ---------------- */}
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
                      format="DD MMMM YYYY"
                      className={`${inputStyle} pt-2`}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="nextAppointment" label="นัดครั้งถัดไป">
                    <DatePicker
                      format="DD MMMM YYYY"
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

            <div className="mt-8 flex justify-center items-center gap-3">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                className="h-10 px-8 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-[#0683e9] to-[#2593fc] border-0 flex items-center"
              >
                บันทึกข้อมูลการเยี่ยมบ้าน
              </Button>

              <Button
                onClick={handleAutoFill}
                icon={<ExperimentOutlined />}
                className="h-10 px-6 rounded-lg text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-amber-500 hover:bg-amber-600 text-white border-none flex items-center"
              >
                สุ่มข้อมูลตัวอย่าง
              </Button>
            </div>
          </Form>
        </div>
      </ConfigProvider>
    </Card>
  );
}
