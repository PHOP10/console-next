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
  message,
  InputNumber,
  Divider,
  Button,
  ConfigProvider,
} from "antd";
import dayjs from "dayjs";
import CryptoJS from "crypto-js";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { visitHomeServices } from "../services/visitHome.service";
import { VisitHomeType, MasterPatientType } from "../../common";
import th_TH from "antd/locale/th_TH";
import {
  UserOutlined,
  HeartOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";

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
  initialMode: "view" | "edit";
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

  // --- Logic เดิม (Encryption/Decryption) ---
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

  const encryptData = (text: string) => {
    if (!text) return null;
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  };

  useEffect(() => {
    if (visible) {
      setMode(initialMode);
    }
  }, [visible, initialMode]);

  useEffect(() => {
    if (visible && record) {
      const decryptedFirstName = decryptData(record.firstName);
      const decryptedLastName = decryptData(record.lastName);
      const decryptedFullName = decryptData(record.fullName);
      const displayFullName =
        decryptedFullName ||
        `${decryptedFirstName} ${decryptedLastName}`.trim();

      const initialValues = {
        ...record,
        fullName: displayFullName,
        address: decryptData(record.address),
        hn: decryptData(record.hn),
        cid: decryptData(record.cid),
        phone: decryptData(record.phone),
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
      const fullNameStr = values.fullName || "";
      const nameParts = fullNameStr.trim().split(/\s+/);
      const firstNameRaw = nameParts[0] || "-";
      const lastNameRaw = nameParts.slice(1).join(" ") || "-";

      const payload = {
        id: record.id,
        patientTypeId: values.patientTypeId || null,
        age: values.age ? Number(values.age) : null,
        hhcNo: values.hhcNo || null,
        allergies: values.allergies || null,
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
        temperature: values.temperature ? Number(values.temperature) : null,
        pulseRate: values.pulseRate ? Number(values.pulseRate) : null,
        respRate: values.respRate ? Number(values.respRate) : null,
        oxygenSat: values.oxygenSat ? Number(values.oxygenSat) : null,
        bloodPressure: values.bloodPressure || null,
        initialHistory: values.initialHistory || null,
        symptoms: values.symptoms || null,
        diagnosis: values.diagnosis || null,
        medication: values.medication || null,
        medicalEquipment: values.medicalEquipment || null,
        careNeeds: values.careNeeds || null,
        notes: values.notes || null,
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

  // --- Styles Constants ---
  // ใช้ h-10 เพื่อความ Compact ใน Modal
  const inputStyle =
    "w-full h-10 rounded-lg border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm";

  const textAreaStyle =
    "w-full rounded-lg border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm";

  const selectStyle =
    "h-10 w-full [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400 text-sm";

  const SectionHeader = ({ icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 text-[#0683e9] font-bold text-base mb-3 mt-1">
      {icon} {title}
    </div>
  );

  return (
    <ConfigProvider locale={th_TH}>
      <Modal
        title={
          <div className="text-xl font-bold text-[#0683e9] text-center w-full">
            {mode === "view" ? (
              <span>📄 รายละเอียดการเยี่ยมบ้าน</span>
            ) : (
              <span>✏️ แก้ไขข้อมูลการเยี่ยมบ้าน</span>
            )}
          </div>
        }
        open={visible}
        onCancel={() => {
          form.resetFields();
          onCancel();
        }}
        width={1000}
        centered
        maskClosable={true}
        footer={null} // Custom Footer ด้านล่างฟอร์มแทน
        styles={{
          content: { borderRadius: "20px", padding: "24px" },
          header: {
            marginBottom: "16px",
            borderBottom: "1px solid #f0f0f0",
            paddingBottom: "12px",
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          disabled={mode === "view"}
          className="compact-form"
        >
          {/* ---------------- Section 1: ข้อมูลผู้ป่วย ---------------- */}
          <SectionHeader icon={<UserOutlined />} title="ข้อมูลผู้ป่วย" />
          <Row gutter={[12, 4]}>
            <Col xs={12} md={4}>
              <Form.Item name="hhcNo" label="เลขที่ HHC">
                <Input className={inputStyle} />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="referralDate" label="วันที่ส่ง">
                <DatePicker
                  format="DD-MM-YYYY"
                  className={`${inputStyle} w-full`}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="patientTypeId"
                label="ประเภทผู้ป่วย"
                rules={[{ required: true, message: "กรุณาเลือกประเภท" }]}
              >
                <Select className={selectStyle}>
                  {masterPatients.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.typeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item
                name="fullName"
                label="ชื่อ-นามสกุล"
                rules={[{ required: true, message: "ระบุชื่อ-สกุล" }]}
              >
                <Input className={inputStyle} />
              </Form.Item>
            </Col>

            {/* แถว 2 */}
            <Col xs={12} md={2}>
              <Form.Item name="age" label="อายุ (ปี)">
                <InputNumber className={`${inputStyle} w-full pt-1`} min={0} />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="hn" label="HN">
                <Input className={inputStyle} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="cid" label="เลขบัตรประชาชน">
                <Input className={inputStyle} maxLength={13} />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="dob" label="วันเกิด">
                <DatePicker
                  format="DD-MM-YYYY"
                  className={`${inputStyle} w-full`}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="phone" label="เบอร์โทรศัพท์">
                <Input className={inputStyle} maxLength={10} />
              </Form.Item>
            </Col>

            {/* แถว 3 */}
            <Col xs={24} md={8}>
              <Form.Item name="allergies" label="ประวัติแพ้ยา/อาหาร">
                <Input className={`${inputStyle} text-red-600 font-medium`} />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item
                name="address"
                label="ที่อยู่ปัจจุบัน"
                rules={[{ required: true }]}
              >
                <Input className={inputStyle} />
              </Form.Item>
            </Col>
          </Row>

          <Divider dashed style={{ margin: "12px 0" }} />

          {/* ---------------- Section 2: สัญญาณชีพ & ประวัติ ---------------- */}
          <SectionHeader icon={<HeartOutlined />} title="ประวัติและสัญญาณชีพ" />
          <Row gutter={[12, 4]}>
            <Col xs={12} md={4}>
              <Form.Item name="admissionDate" label="วันรับรักษา">
                <DatePicker
                  format="DD-MM-YYYY"
                  className={`${inputStyle} w-full`}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item name="dischargeDate" label="วันจำหน่าย">
                <DatePicker
                  format="DD-MM-YYYY"
                  className={`${inputStyle} w-full`}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item name="initialHistory" label="ประวัติการเจ็บป่วยแรกรับ">
                <TextArea
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  className={textAreaStyle}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Vital Signs Bar */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
            <Row gutter={[12, 0]} align="middle">
              <Col xs={24} md={2}>
                <span className="font-bold text-slate-500 uppercase text-xs">
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
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6} md={6}>
                <Form.Item
                  name="bloodPressure"
                  label="BP (mmHg)"
                  style={{ marginBottom: 0 }}
                >
                  <Input className={`${inputStyle} bg-white`} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Form.Item
                  name="oxygenSat"
                  label="O2 (%)"
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber
                    className={`${inputStyle} pt-1 bg-white`}
                    style={{ width: "100%" }}
                    max={100}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider dashed style={{ margin: "12px 0" }} />

          {/* ---------------- Section 3: Split Layout ---------------- */}
          <Row gutter={24}>
            {/* Left: Assessment */}
            <Col xs={24} md={12}>
              <SectionHeader icon={<FileTextOutlined />} title="การประเมิน" />
              <Form.Item name="symptoms" label="อาการปัจจุบัน">
                <TextArea
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  className={textAreaStyle}
                />
              </Form.Item>
              <Form.Item name="diagnosis" label="การวินิจฉัยโรค">
                <TextArea
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  className={textAreaStyle}
                />
              </Form.Item>
              <Form.Item name="careNeeds" label="ปัญหา/ความต้องการ">
                <TextArea
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  className={textAreaStyle}
                />
              </Form.Item>
            </Col>

            {/* Right: Treatment */}
            <Col
              xs={24}
              md={12}
              className="md:border-l md:border-dashed md:border-gray-200 md:pl-6"
            >
              <SectionHeader
                icon={<MedicineBoxOutlined />}
                title="การรักษาและอุปกรณ์"
              />
              <Form.Item name="medication" label="ยากลับบ้าน">
                <TextArea
                  autoSize={{ minRows: 2, maxRows: 5 }}
                  className={textAreaStyle}
                />
              </Form.Item>
              <Form.Item name="medicalEquipment" label="อุปกรณ์ติดตัว">
                <TextArea
                  autoSize={{ minRows: 2, maxRows: 5 }}
                  className={textAreaStyle}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider dashed style={{ margin: "12px 0" }} />

          {/* ---------------- Section 4: Footer (Appointment) ---------------- */}
          <SectionHeader icon={<CalendarOutlined />} title="การนัดหมาย" />
          <Row gutter={[12, 4]} align="bottom">
            <Col xs={12} md={5}>
              <Form.Item
                name="visitDate"
                label="วันที่เยี่ยม"
                rules={[{ required: true }]}
              >
                <DatePicker
                  format="DD-MM-YYYY"
                  className={`${inputStyle} w-full`}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={5}>
              <Form.Item name="nextAppointment" label="นัดถัดไป">
                <DatePicker
                  format="DD-MM-YYYY"
                  className={`${inputStyle} w-full`}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={14}>
              <Form.Item name="notes" label="หมายเหตุ">
                <Input className={inputStyle} />
              </Form.Item>
            </Col>
          </Row>

          {/* --- Buttons Area --- */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              onClick={onCancel}
              className="h-10 px-6 rounded-lg text-gray-600 hover:bg-gray-100 border-gray-300"
              icon={<CloseOutlined />}
            >
              {mode === "view" ? "ปิดหน้าต่าง" : "ยกเลิก"}
            </Button>

            {mode === "view" ? (
              <Button
                type="primary"
                onClick={() => setMode("edit")}
                className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0"
                icon={<EditOutlined />}
              >
                แก้ไขข้อมูล
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={handleUpdate}
                className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0"
                icon={<SaveOutlined />}
              >
                บันทึกการแก้ไข
              </Button>
            )}
          </div>
        </Form>
      </Modal>
    </ConfigProvider>
  );
}
