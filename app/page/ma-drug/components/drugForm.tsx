"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Card,
  Select,
  Row,
  Col,
  Space,
  AutoComplete,
} from "antd";
import { SaveOutlined, ClearOutlined, ExperimentOutlined } from "@ant-design/icons";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType, MasterDrugType } from "../../common";



interface DrugFormProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setData: React.Dispatch<React.SetStateAction<DrugType[]>>;
}

export default function DrugForm({
  setLoading,
  loading,
  setData,
}: DrugFormProps) {
  const [form] = Form.useForm();
  const [masterDrugOptions, setMasterDrugOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  // โหลด MasterDrug มาทำเป็น dropdown
  useEffect(() => {
    const fetchMasterDrug = async () => {
      try {
        const res: MasterDrugType[] =
          await intraAuthService.getMasterDrugQuery();
        if (Array.isArray(res)) {
          setMasterDrugOptions(
            res.map((item) => ({
              label: item.drugType,
              value: item.drugTypeId,
            })),
          );
        }
      } catch (error) {
        console.error(error);
        message.error("ไม่สามารถโหลดประเภทยาได้");
      }
    };

    fetchMasterDrug();
  }, []);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      // แปลงค่า number ให้แน่ใจว่าเป็น number จริงๆ ก่อนส่ง
      const payload = {
        ...values,
        price: Number(values.price),
        quantity: Number(values.quantity),
      };

      const newDrug: DrugType = await intraAuthService.createDrug(payload);
      setData((prev) => [newDrug, ...prev]); // เอาตัวใหม่ขึ้นบนสุด เพื่อให้ user เห็นทันที
      message.success("เพิ่มข้อมูลยาสำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("เพิ่มข้อมูลยาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const packingOptions = [
    { value: "10's" },
    { value: "50's" },
    { value: "100's" },
    { value: "500's" },
    { value: "1000's" },
    { value: "แผง" },
    { value: "กล่อง" },
    { value: "ขวด" },
    { value: "กระปุก" },
    { value: "ซอง" },
    { value: "ถุง" },
    { value: "ห่อ" },
    { value: "แพ็ค" },
    { value: "ชิ้น" },
    { value: "คู่" },
    { value: "ชุด" },
    { value: "ม้วน" },
    { value: "หลอด" },
    { value: "Vial" },
    { value: "Amp" },
    { value: "5 g." },
    { value: "10 g." },
    { value: "lb." },
  ];

  // --- Style Constants (Master Template) ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  // Class สำหรับ Select ของ Antd
  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  // Class สำหรับ AutoComplete (ใช้คล้าย Select/Input)
  const autoCompleteStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400 focus-within:[&>.ant-select-selector]:!border-blue-500 focus-within:[&>.ant-select-selector]:!ring-4 focus-within:[&>.ant-select-selector]:!ring-blue-50 focus-within:[&>.ant-select-selector]:!shadow-md";

  /* --------------------------------------ข้อมูลตัวอย่าง--------------------------------------- */
  const getRandomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const getRandomElement = (arr: any[]) =>
    arr[Math.floor(Math.random() * arr.length)];

  const handleAutoFill = () => {
    // A. ชุดข้อมูลตัวอย่าง
    const drugNames = [
      { th: "พาราเซตามอล 500 มก.", en: "Paracetamol 500mg" },
      { th: "อะม็อกซีซิลลิน 500 มก.", en: "Amoxicillin 500mg" },
      { th: "โอเมพราโซล 20 มก.", en: "Omeprazole 20mg" },
      { th: "ลอร์ราทาดีน 10 มก.", en: "Loratadine 10mg" },
      { th: "เมทฟอร์มิน 500 มก.", en: "Metformin 500mg" },
    ];

    const packings = [
      "แผง/10 เม็ด",
      "ขวด/60 มล.",
      "กล่อง/50 แผง",
      "กระปุก/1,000 เม็ด",
    ];
    const notes = [
      "ยาใช้ภายใน",
      "เก็บให้พ้นแสง",
      "ยาควบคุมพิเศษ",
      "-",
      "เก็บในอุณหภูมิต่ำกว่า 30 องศา",
    ];

    // B. เลือกข้อมูลสุ่ม
    const selectedDrug = getRandomElement(drugNames);
    const randWorkingCode = `W-${getRandomInt(100, 999)}`;

    // สุ่มเลือกประเภทยาจาก Options ที่มีใน Master Data
    let randTypeId = undefined;
    if (masterDrugOptions && masterDrugOptions.length > 0) {
      randTypeId = getRandomElement(masterDrugOptions).value;
    }

    // ✅ C. ใส่ค่าเข้าฟอร์ม
    form.setFieldsValue({
      workingCode: randWorkingCode,
      drugTypeId: randTypeId,
      name: `${selectedDrug.th} (${selectedDrug.en})`,
      packagingSize: getRandomElement(packings),
      price: getRandomInt(10, 500), // สุ่มราคา 10 - 500 บาท
      quantity: getRandomInt(50, 500), // สุ่มจำนวนเริ่มต้น 50 - 500
      note: getRandomElement(notes),
    });
  };

  return (
    <Card
      className="shadow-lg rounded-2xl border-gray-100 overflow-hidden"
      style={{ maxWidth: 800, margin: "0 auto" }}
      title={
        <div className="text-2xl font-bold text-[#0683e9] text-center py-2">
          เพิ่มข้อมูลยาใหม่
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ quantity: 0, price: 0 }}
      >
        {/* Row 1: รหัสยา, ประเภทยา */}
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Working Code (รหัสยา)"
              name="workingCode"
              rules={[{ required: true, message: "กรุณากรอก Working Code" }]}
            >
              <Input placeholder="เช่น W-001" className={inputStyle} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="ประเภทยา"
              name="drugTypeId"
              rules={[{ required: true, message: "กรุณาเลือกประเภทยา" }]}
            >
              <Select
                placeholder="-- เลือกประเภทยา --"
                options={masterDrugOptions}
                loading={masterDrugOptions.length === 0}
                showSearch
                optionFilterProp="label"
                className={selectStyle}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 2: ชื่อยา */}
        <Form.Item
          label="ชื่อยา"
          name="name"
          rules={[{ required: true, message: "กรุณากรอกชื่อยา" }]}
        >
          <Input
            placeholder="ระบุชื่อยาภาษาไทย หรือ อังกฤษ"
            className={inputStyle}
          />
        </Form.Item>

        {/* Row 3: ขนาดบรรจุ, ราคา, คงเหลือ */}
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item
              label="ขนาดบรรจุ"
              name="packagingSize"
              rules={[{ required: true, message: "ระบุขนาดบรรจุ" }]}
            >
              <AutoComplete
                options={packingOptions}
                placeholder="เช่น แผง/กล่อง หรือพิมพ์ระบุเอง"
                filterOption={(inputValue, option) =>
                  option!.value
                    .toUpperCase()
                    .indexOf(inputValue.toUpperCase()) !== -1
                }
                allowClear
                className={autoCompleteStyle}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="ราคาต่อหน่วย (บาท)"
              name="price"
              rules={[{ required: true, message: "ระบุราคา" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                step={0.01}
                formatter={(value) =>
                  `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: any) => value?.replace(/\฿\s?|(,*)/g, "") || ""}
                className={`${inputStyle} pt-1`}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="จำนวนคงเหลือเริ่มต้น"
              name="quantity"
              rules={[{ required: true, message: "ระบุจำนวน" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                className={`${inputStyle} pt-1`}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* หมายเหตุ */}
        <Form.Item label="หมายเหตุ" name="note">
          <Input.TextArea
            rows={3}
            placeholder="ระบุข้อมูลเพิ่มเติม (ถ้ามี)"
            className={textAreaStyle}
          />
        </Form.Item>

        {/* ปุ่มกด (จัดกึ่งกลาง) */}
        <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
          <Space size="middle">
            {/* ✅ ปุ่มสุ่มข้อมูลตัวอย่าง (สีเหลือง/ส้ม) */}
            <Button
              onClick={handleAutoFill}
              icon={<ExperimentOutlined />} // อย่าลืม import
              className="h-9 px-6 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center"
            >
              สุ่มข้อมูลตัวอย่าง
            </Button>

            <Button
              icon={<ClearOutlined />}
              onClick={() => form.resetFields()}
              disabled={loading}
              className="h-9 px-6 rounded-lg text-sm border-gray-300 text-gray-600 hover:text-red-500 hover:border-red-400 shadow-sm transition-all flex items-center"
            >
              ล้างค่า
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              className="h-9 px-6 rounded-lg text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center bg-[#0683e9] border-none"
            >
              บันทึกข้อมูลยา
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
