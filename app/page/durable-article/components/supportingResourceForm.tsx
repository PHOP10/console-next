"use client";

import React from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Card,
  Row,
  Col,
  ConfigProvider,
} from "antd";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";
import th_TH from "antd/locale/th_TH";
import { ExperimentOutlined } from "@ant-design/icons";

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  fetchData: () => Promise<void>;
};

export default function SupportingResourceForm({ setLoading, loading }: Props) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        acquiredDate: values.acquiredDate
          ? values.acquiredDate.toISOString()
          : null,
        type: "supportingResource",
      };
      await intraAuthService.createDurableArticle(payload);
      setLoading(true);
      message.success("บันทึกข้อมูลครุภัณฑ์สำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  const formatBuddhist = (value: dayjs.Dayjs | null) => {
    if (!value) return "";
    const date = dayjs(value).locale("th");
    const day = date.date();
    const month = date.format("MMMM");
    const year = date.year() + 543;
    return `${day} ${month} ${year}`;
  };

  // --- Style Constants (Master Template) ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  // Class สำหรับ Select ของ Antd
  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  /* -------------------------------------------ข้อมูลตัวอย่าง----------------------------------------- */
  const handleAutoFill = () => {
    // A. ชุดข้อมูลตัวอย่าง
    const categories = [
      "ครุภัณฑ์วิทยาศาสตร์การแพทย์",
      "ครุภัณฑ์สำนักงาน",
      "ครุภัณฑ์คอมพิวเตอร์",
      "ครุภัณฑ์การแพทย์",
      "ครุภัณฑ์ไฟฟ้าและวิทยุ",
    ];
    const descriptions = [
      "เครื่องวัดความดันโลหิตแบบดิจิตอล Omron",
      "เครื่องผลิตออกซิเจน 5 ลิตร Yuwell",
      "คอมพิวเตอร์ All-in-One Dell OptiPlex",
      "เครื่องตรวจคลื่นไฟฟ้าหัวใจ (EKG)",
      "ตู้เย็นเก็บยาและเวชภัณฑ์ 10 คิว",
    ];
    const vendors = [
      "บจก. การแพทย์ไทย",
      "ร้านเมดิคอล ซัพพลาย",
      "หจก. รวมเวชภัณฑ์",
      "บริษัท นำเข้าจำกัด",
    ];
    const acqTypes = ["งบประมาณ", "เงินบำรุง", "เงินงบประมาณ ตกลงราคา"];

    // B. สุ่มตัวเลขและวันที่
    const getRandomInt = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;
    const getRandomElement = (arr: any[]) =>
      arr[Math.floor(Math.random() * arr.length)];

    const randCode = `${getRandomInt(1000, 9999)}-${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`;
    const randDocId = `ตล.${getRandomInt(10, 99)}/${getRandomInt(2567, 2568)}`;
    const randPrice = getRandomInt(5000, 55000);
    const randLifespan = getRandomElement([3, 5, 8, 10]);
    const randDate = dayjs().subtract(getRandomInt(1, 12), "month");

    // คำนวณค่าเสื่อมเบื้องต้น (ราคา / (ปี * 12))
    const monthlyDep = parseFloat((randPrice / (randLifespan * 12)).toFixed(2));

    // ✅ C. ใส่ค่าเข้าฟอร์ม
    form.setFieldsValue({
      code: randCode,
      acquiredDate: randDate,
      documentId: randDocId,
      description: getRandomElement(descriptions),
      registrationNumber: `SN-${getRandomInt(100000, 999999)}`,
      category: getRandomElement(categories),
      attributes: "สภาพใหม่ 100%, มีใบรับประกัน",
      responsibleAgency: getRandomElement(vendors),
      unitPrice: randPrice,
      acquisitionType: getRandomElement(acqTypes),
      usageLifespanYears: randLifespan,
      monthlyDepreciation: monthlyDep,
      note: Math.random() > 0.5 ? "ตรวจรับเรียบร้อย" : "-",
    });
  };

  return (
    <Card>
      <ConfigProvider locale={th_TH}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            usageLifespanYears: 1,
            unitPrice: 0,
            monthlyDepreciation: 0,
          }}
        >
          {/* Row 1: รหัส, วันที่ได้มา */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="รหัส"
                name="code"
                rules={[
                  { required: true, message: "กรุณากรอกรหัสครุภัณฑ์" },
                  {
                    pattern: /^[0-9/-]{13,17}$/,
                    message: "กรุณากรอกเฉพาะ 0-9, /, -",
                  },
                ]}
              >
                <Input
                  placeholder="เช่น xxxx-xxx-xxxx"
                  maxLength={17}
                  className={inputStyle}
                  onKeyPress={(e) => {
                    const allowed = /[0-9/-]/;
                    if (!allowed.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="วันที่ได้มา"
                name="acquiredDate"
                rules={[{ required: true, message: "กรุณาเลือกวันที่ได้มา" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="เลือกวันที่"
                  format={(value) => formatBuddhist(value as dayjs.Dayjs)}
                  className={`${inputStyle} pt-2`}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 2: เลขที่เอกสาร, รายละเอียด */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="เลขที่เอกสาร"
                name="documentId"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกเลขที่เอกสาร",
                  },
                  {
                    pattern: /^[ก-ฮA-Za-z0-9./\s]+$/,
                    message: "กรอกได้เฉพาะตัวอักษร ตัวเลข จุด และ /",
                  },
                ]}
              >
                <Input
                  placeholder="กรอกเลขที่เอกสาร"
                  maxLength={14}
                  className={inputStyle}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="ชื่อ ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ"
                name="description"
                rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
              >
                <Input.TextArea rows={2} className={textAreaStyle} />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 3: หมายเลขทะเบียน, ประเภท */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="หมายเลขและทะเบียน"
                name="registrationNumber"
                rules={[{ required: true, message: "กรุณาหมายเลขและทะเบียน" }]}
              >
                <Input
                  placeholder="กรอกหมายเลขและทะเบียน"
                  className={inputStyle}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="ประเภท"
                name="category"
                rules={[{ required: true, message: "กรุณาเลือกประเภท" }]}
              >
                <Select
                  placeholder="เลือกประเภท"
                  className={selectStyle}
                  onChange={(value) => {
                    form.setFieldValue(
                      "category",
                      value === "other" ? "" : value,
                    );
                  }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ display: "flex", padding: 8 }}>
                        <Input
                          placeholder="กรอกประเภทอื่นๆ"
                          className="rounded-lg"
                          onPressEnter={(e) => {
                            form.setFieldValue(
                              "category",
                              e.currentTarget.value,
                            );
                          }}
                          onBlur={(e) => {
                            form.setFieldValue(
                              "category",
                              e.currentTarget.value,
                            );
                          }}
                        />
                      </div>
                    </>
                  )}
                >
                  <Select.Option value="ครุภัณฑ์งานบ้านงานครัว">
                    ครุภัณฑ์งานบ้านงานครัว
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์วิทยาศาสตร์การแพทย์">
                    ครุภัณฑ์วิทยาศาสตร์การแพทย์
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์สำนักงาน">
                    ครุภัณฑ์สำนักงาน
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์ยานพาหนะและขนส่ง">
                    ครุภัณฑ์ยานพาหนะและขนส่ง
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์ไฟฟ้าและวิทยุ">
                    ครุภัณฑ์ไฟฟ้าและวิทยุ
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์โฆษณาและเผยแพร่">
                    ครุภัณฑ์โฆษณาและเผยแพร่
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์คอมพิวเตอร์">
                    ครุภัณฑ์คอมพิวเตอร์
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์การแพทย์">
                    ครุภัณฑ์การแพทย์
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์ก่อสร้าง">
                    ครุภัณฑ์ก่อสร้าง
                  </Select.Option>
                  <Select.Option value="other">ครุภัณฑ์อื่น...</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Row 4: คุณสมบัติ, ชื่อผู้ขาย */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="ลักษณะ/คุณสมบัติ"
                name="attributes"
                rules={[{ required: true, message: "กรุณากรอกคุณสมบัติ" }]}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="กรอกลักษณะ/คุณสมบัติ "
                  className={textAreaStyle}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="ชื่อผู้ขาย/ผู้รับจ้าง/ผู้บริจาค"
                name="responsibleAgency"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอก ชื่อผู้ขาย/ผู้รับจ้าง/ผู้บริจาค",
                  },
                ]}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="กรอกชื่อผู้ขาย/ผู้รับจ้าง/ผู้บริจาค"
                  className={textAreaStyle}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 5: ราคา, วิธีการได้มา */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="ราคาต่อหน่วย"
                name="unitPrice"
                rules={[{ required: true, message: "กรุณากรอกราคาต่อหน่วย" }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-1`}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="acquisitionType"
                label="วิธีการได้มา"
                rules={[{ required: true, message: "กรุณาเลือกวิธีการได้มา" }]}
              >
                <Select
                  placeholder="เลือกงบประมาณ"
                  className={selectStyle}
                  onChange={(value) => {
                    form.setFieldValue(
                      "acquisitionType",
                      value === "other" ? "" : value,
                    );
                  }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ display: "flex", padding: 8 }}>
                        <Input
                          placeholder="กรอกงบประมาณอื่นๆ"
                          className="rounded-lg"
                          onPressEnter={(e) => {
                            form.setFieldValue("budget", e.currentTarget.value);
                          }}
                          onBlur={(e) => {
                            form.setFieldValue("budget", e.currentTarget.value);
                          }}
                        />
                      </div>
                    </>
                  )}
                >
                  <Select.Option value="งบประมาณ">งบประมาณ</Select.Option>
                  <Select.Option value="เงินบำรุง">เงินบำรุง</Select.Option>
                  <Select.Option value="เงินงบประมาณ ตกลงราคา">
                    เงินงบประมาณ ตกลงราคา
                  </Select.Option>
                  <Select.Option value="other">อื่นๆ...</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Row 6: อายุการใช้งาน, ค่าเสื่อม */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="อายุการใช้งาน (ปี)"
                name="usageLifespanYears"
                rules={[{ required: true, message: "กรุณากรอกอายุการใช้งาน" }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-1`}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="ค่าเสื่อมราคาต่อเดือน"
                name="monthlyDepreciation"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกค่าเสื่อมราคาต่อเดือน",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-1`}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea rows={2} className={textAreaStyle} />
          </Form.Item>

          <Form.Item style={{ textAlign: "center", marginTop: "24px" }}>
            <div className="flex justify-center items-center gap-3">
              <Button
                type="primary"
                htmlType="submit"
                className="h-10 px-8 rounded-lg text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-[#0683e9] flex items-center border-none"
              >
                บันทึก
              </Button>

              <Button
                onClick={handleAutoFill}
                icon={<ExperimentOutlined />}
                className="h-10 px-6 rounded-lg text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-amber-500 hover:bg-amber-600 text-white border-none flex items-center"
              >
                สุ่มข้อมูลตัวอย่าง
              </Button>
            </div>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </Card>
  );
}
