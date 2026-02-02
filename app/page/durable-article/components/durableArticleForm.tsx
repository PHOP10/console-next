"use client";

import React, { useRef } from "react";
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
import { useSession } from "next-auth/react";
import { buddhistLocale } from "@/app/common";

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  fetchData: () => Promise<void>;
};

export default function DurableArticleForm({
  setLoading,
  loading,
  fetchData,
}: Props) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);
  const { data: session } = useSession();

  const categoryRef = useRef<any>(null);
  const acquisitionRef = useRef<any>(null);

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        acquiredDate: values.acquiredDate
          ? values.acquiredDate.toISOString()
          : null,
        type: "durableArticles",
        status: "use",
        createdName: session?.user?.fullName || null,
      };

      setLoading(true);
      await intraAuthService.createDurableArticle(payload);

      message.success("บันทึกข้อมูลครุภัณฑ์สำเร็จ");

      await fetchData();

      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
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

  // --- Style Constants ---
  const inputStyle =
    "w-full h-10 sm:h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-sm";

  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-sm";

  const selectStyle =
    "h-10 sm:h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400 text-sm";

  return (
    <Card
      className="shadow-md rounded-2xl border-gray-100"
      bodyStyle={{ padding: "16px 20px" }}
    >
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
          {/* ใช้ Gutter แบบเดียวกับหน้า Edit เพื่อความสมดุล */}
          <Row
            gutter={[
              { xs: 10, sm: 24 },
              { xs: 6, sm: 16 },
            ]}
          >
            {/* --- Row 1: รหัส | เลขที่เอกสาร | ทะเบียน --- */}
            {/* แบ่งครึ่งบนมือถือ (xs=12) */}
            <Col xs={12} md={8}>
              <Form.Item
                label="รหัส"
                name="code"
                rules={[
                  { required: true, message: "ระบุรหัส" },
                  {
                    pattern: /^[0-9/-]{13,17}$/,
                    message: "กรอกเฉพาะ 0-9, /, -",
                  },
                ]}
                className="mb-1 sm:mb-6"
              >
                <Input
                  placeholder="xxxx-xxx-xxxx"
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

            <Col xs={12} md={8}>
              <Form.Item
                label="เลขที่เอกสาร"
                name="documentId"
                rules={[
                  { required: true, message: "ระบุเลขที่เอกสาร" },
                  {
                    pattern: /^[ก-ฮA-Za-z0-9./\s]+$/,
                    message: "อักษร ตัวเลข . /",
                  },
                ]}
                className="mb-1 sm:mb-6"
              >
                <Input
                  placeholder="เลขที่เอกสาร"
                  maxLength={14}
                  className={inputStyle}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="หมายเลขและทะเบียน"
                name="registrationNumber"
                className="mb-1 sm:mb-6"
              >
                <Input
                  placeholder="กรอกหมายเลขและทะเบียน"
                  className={inputStyle}
                />
              </Form.Item>
            </Col>

            {/* --- Row 2: รายละเอียด | สถานที่ (TextArea เต็มจอ) --- */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ชื่อ ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ"
                name="description"
                rules={[{ required: true, message: "ระบุรายละเอียด" }]}
                className="mb-1 sm:mb-6"
              >
                <Input.TextArea
                  rows={1}
                  className={textAreaStyle}
                  maxLength={200}
                  style={{ minHeight: "44px" }}
                  placeholder="กรอกชื่อ ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="สถานที่ตั้ง/ที่อยู่"
                name="location"
                rules={[{ required: true, message: "ระบุสถานที่ตั้ง" }]}
                className="mb-1 sm:mb-6"
              >
                <Input.TextArea
                  placeholder="กรอกสถานที่ตั้ง/ที่อยู่"
                  className={inputStyle}
                  maxLength={150}
                  style={{ minHeight: "44px" }}
                />
              </Form.Item>
            </Col>

            {/* --- Row 3: ประเภท | ผู้ขาย (จุดที่เคยเอียง) --- */}
            <Col xs={12} md={12}>
              <Form.Item
                label="ประเภท"
                name="category"
                rules={[{ required: true, message: "เลือกประเภท" }]}
                className="mb-1 sm:mb-6"
              >
                <Select
                  ref={categoryRef}
                  placeholder="เลือกประเภท"
                  className={selectStyle}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ display: "flex", padding: 8 }}>
                        <Input
                          placeholder="อื่นๆ"
                          className="rounded-lg text-sm"
                          onPressEnter={(e) => {
                            e.preventDefault();
                            form.setFieldValue(
                              "category",
                              e.currentTarget.value,
                            );
                            categoryRef.current?.blur();
                          }}
                          onBlur={(e) => {
                            if (e.currentTarget.value) {
                              form.setFieldValue(
                                "category",
                                e.currentTarget.value,
                              );
                            }
                          }}
                        />
                      </div>
                    </>
                  )}
                >
                  <Select.Option value="ครุภัณฑ์งานบ้านงานครัว">
                    งานบ้านงานครัว
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์วิทยาศาสตร์การแพทย์">
                    วิทยาศาสตร์การแพทย์
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์สำนักงาน">
                    สำนักงาน
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์ยานพาหนะและขนส่ง">
                    ยานพาหนะ
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์ไฟฟ้าและวิทยุ">
                    ไฟฟ้าและวิทยุ
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์โฆษณาและเผยแพร่">
                    โฆษณา
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์คอมพิวเตอร์">
                    คอมพิวเตอร์
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์การแพทย์">
                    การแพทย์
                  </Select.Option>
                  <Select.Option value="ครุภัณฑ์ก่อสร้าง">
                    ก่อสร้าง
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={12} md={12}>
              <Form.Item
                label={
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                      display: "block",
                    }}
                    title="ผู้ขาย/ผู้บริจาค"
                  >
                    ผู้ขาย/ผู้บริจาค
                  </div>
                }
                name="responsibleAgency"
                rules={[{ required: true, message: "ระบุผู้ขาย" }]}
                className="mb-1 sm:mb-6"
              >
                <Input
                  className={inputStyle}
                  placeholder="ชื่อผู้ขาย/ผู้บริจาค"
                  maxLength={150}
                />
              </Form.Item>
            </Col>
            {/* --- Row 4: วิธีการได้มา | วันที่ --- */}
            <Col xs={12} md={12}>
              <Form.Item
                name="acquisitionType"
                label="วิธีการได้มา"
                rules={[{ required: true, message: "เลือกวิธีได้มา" }]}
                className="mb-1 sm:mb-6"
              >
                <Select
                  ref={acquisitionRef}
                  placeholder="เลือก"
                  className={selectStyle}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ display: "flex", padding: 8 }}>
                        <Input
                          placeholder="อื่นๆ"
                          className="rounded-lg text-sm"
                          onPressEnter={(e) => {
                            e.preventDefault();
                            form.setFieldValue(
                              "acquisitionType",
                              e.currentTarget.value,
                            );
                            acquisitionRef.current?.blur();
                          }}
                          onBlur={(e) => {
                            if (e.currentTarget.value) {
                              form.setFieldValue(
                                "acquisitionType",
                                e.currentTarget.value,
                              );
                            }
                          }}
                        />
                      </div>
                    </>
                  )}
                >
                  <Select.Option value="งบประมาณ">งบประมาณ</Select.Option>
                  <Select.Option value="เงินบำรุง">เงินบำรุง</Select.Option>
                  <Select.Option value="เงินงบประมาณ ตกลงราคา">
                    ตกลงราคา
                  </Select.Option>
                  <Select.Option value="สนับสนุน">สนับสนุน</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={12} md={12}>
              <Form.Item
                label="วันที่ได้มา"
                name="acquiredDate"
                rules={[{ required: true, message: "เลือกวันที่" }]}
                className="mb-1 sm:mb-6"
              >
                <DatePicker
                  locale={buddhistLocale}
                  style={{ width: "100%" }}
                  placeholder="วว/ดด/ปป"
                  format={(value) => formatBuddhist(value as dayjs.Dayjs)}
                  className={`${inputStyle} pt-2`}
                />
              </Form.Item>
            </Col>

            {/* --- Row 5: ราคา | ค่าเสื่อม | อายุ --- */}
            <Col xs={12} md={8}>
              <Form.Item
                label="ราคาต่อหน่วย"
                name="unitPrice"
                rules={[{ required: true, message: "ระบุราคา" }]}
                className="mb-1 sm:mb-6"
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  precision={2}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value: any) => value!.replace(/\$\s?|(,*)/g, "")}
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-1`}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>

            <Col xs={12} md={8}>
              <Form.Item
                label="ค่าเสื่อม/เดือน"
                name="monthlyDepreciation"
                rules={[{ required: true, message: "ระบุค่าเสื่อม" }]}
                className="mb-1 sm:mb-6"
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  precision={2}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value: any) => value!.replace(/\$\s?|(,*)/g, "")}
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-1`}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="อายุการใช้งาน (ปี)"
                name="usageLifespanYears"
                rules={[{ required: true, message: "ระบุอายุ" }]}
                className="mb-1 sm:mb-6"
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-1`}
                  placeholder="0"
                />
              </Form.Item>
            </Col>

            {/* --- Row 6: หมายเหตุ --- */}
            <Col span={24}>
              <Form.Item label="หมายเหตุ" name="note" className="mb-2">
                <Input.TextArea
                  rows={2}
                  className={textAreaStyle}
                  placeholder="กรอกหมายเหตุ (ถ้ามี)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: "center", marginTop: 24 }}>
            <div className="flex justify-center items-center gap-3">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="h-10 px-8 rounded-lg text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-[#0683e9] flex items-center border-none"
              >
                บันทึก
              </Button>
            </div>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </Card>
  );
}
