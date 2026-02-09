"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Button,
  Row,
  Col,
  ConfigProvider,
} from "antd";
import dayjs from "dayjs";
import th_TH from "antd/locale/th_TH";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";
import { DurableArticleType } from "../../common";
import { buddhistLocale } from "@/app/common";

interface DurableArticleEditModalProps {
  open: boolean;
  onClose: () => void;
  record: DurableArticleType | null;
  fetchData: () => Promise<void>;
}

export default function DurableArticleEditModal({
  open,
  onClose,
  record,
  fetchData,
}: DurableArticleEditModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);

  const categoryRef = useRef<any>(null);
  const acquisitionRef = useRef<any>(null);

  useEffect(() => {
    if (open && record) {
      form.setFieldsValue({
        ...record,
        acquiredDate: record.acquiredDate ? dayjs(record.acquiredDate) : null,
      });
    }
  }, [open, record, form]);

  const handleUpdate = async (values: any) => {
    if (!record) return;

    setLoading(true);

    try {
      const payload = {
        ...values,
        id: record.id,
        acquiredDate: values.acquiredDate
          ? values.acquiredDate.toISOString()
          : null,
      };

      await intraAuthService.updateDurableArticle(payload);

      message.success("แก้ไขข้อมูลสำเร็จ");
    } catch (error) {
      console.error("Error updating:", error);
      message.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
      setLoading(false);
      return;
    }
    onClose();
    try {
      await fetchData();
    } catch (refreshError) {
      console.warn("Refresh failed:", refreshError);
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

  // ปรับ Style ให้เหมาะกับมือถือมากขึ้น (ลดขนาด font เล็กน้อยถ้าจำเป็น)
  const inputStyle =
    "w-full h-10 sm:h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-sm";
  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-sm";
  const selectStyle =
    "h-10 sm:h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400 text-sm";

  return (
    <Modal
      title={
        <div className="text-lg sm:text-xl font-bold text-[#0683e9] text-center w-full">
          แก้ไขข้อมูลครุภัณฑ์
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      style={{ maxWidth: "100%", padding: "0" }} // ลด Padding Modal ให้เต็มจอมือถือ
      centered
      destroyOnClose
      styles={{
        content: { borderRadius: "16px", padding: "16px 20px" }, // ลด Padding ภายใน
        header: {
          marginBottom: "12px",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "8px",
        },
      }}
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          {/* ปรับ Gutter (ระยะห่าง) 
             แนวนอน: มือถือห่าง 10px / จอใหญ่ห่าง 24px
             แนวตั้ง: มือถือห่าง 6px / จอใหญ่ห่าง 16px
          */}
          <Row
            gutter={[
              { xs: 10, sm: 24 },
              { xs: 6, sm: 16 },
            ]}
          >
            {/* --- Row 1 --- */}
            {/* ปรับ xs={12} คือแบ่งครึ่งจอซ้ายขวา */}
            <Col xs={12} md={8}>
              <Form.Item
                label="รหัส"
                name="code"
                rules={[
                  { required: true, message: "ระบุรหัส" }, // ย่อข้อความ Error ให้สั้นลง
                  {
                    pattern: /^[0-9/-]{13,17}$/,
                    message: "กรอกเฉพาะ 0-9, /, -",
                  },
                ]}
                className="mb-1 sm:mb-6" // ลดระยะห่างด้านล่างบนมือถือ
              >
                <Input
                  placeholder="xxxx-xxx-xxxx"
                  maxLength={17}
                  className={inputStyle}
                  onKeyPress={(e) => {
                    if (!/[0-9/-]/.test(e.key)) e.preventDefault();
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
                    message: "ตัวอักษร ตัวเลข . /",
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
            {/* หมายเลขทะเบียน ให้เต็มจอ (24) หรือครึ่งจอ (12) ก็ได้ แต่ถ้าเต็มจะสวยกว่าเพราะมันเป็นเศษ */}
            <Col xs={24} md={8}>
              <Form.Item
                label="หมายเลขและทะเบียน"
                name="registrationNumber"
                rules={[{ required: true, message: "ระบุหมายเลข" }]}
                className="mb-1 sm:mb-6"
              >
                <Input placeholder="หมายเลขและทะเบียน" className={inputStyle} />
              </Form.Item>
            </Col>

            {/* --- Row 2 (TextArea ควรเต็มจอเสมอ เพื่อให้พิมพ์สะดวก) --- */}
            <Col xs={24} md={12}>
              <Form.Item
                label="ชื่อ ยี่ห้อ ชนิด แบบ ขนาด"
                name="description"
                rules={[{ required: true, message: "ระบุรายละเอียด" }]}
                className="mb-1 sm:mb-6"
              >
                <Input.TextArea
                  rows={1}
                  className={textAreaStyle}
                  maxLength={200}
                  style={{ minHeight: "44px" }}
                  placeholder="รายละเอียดครุภัณฑ์"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="สถานที่ตั้ง/ที่อยู่"
                name="location"
                rules={[{ required: true, message: "ระบุสถานที่" }]}
                className="mb-1 sm:mb-6"
              >
                <Input.TextArea
                  placeholder="สถานที่ตั้ง"
                  className={inputStyle}
                  maxLength={150}
                  style={{ minHeight: "44px" }}
                />
              </Form.Item>
            </Col>

            {/* --- Row 3 (แบ่งครึ่งซ้ายขวา) --- */}
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
                            if (e.currentTarget.value)
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
                label="ผู้ขาย/ผู้บริจาค"
                name="responsibleAgency"
                rules={[
                  {
                    required: true,
                    message: "ระบุผู้ขาย/ผู้บริจาค",
                  },
                ]}
                className="mb-1 sm:mb-6"
              >
                <Input
                  className={inputStyle}
                  placeholder="ชื่อผู้ขาย"
                  maxLength={150}
                />
              </Form.Item>
            </Col>

            {/* --- Row 4 (แบ่งครึ่งซ้ายขวา) --- */}
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
                            if (e.currentTarget.value)
                              form.setFieldValue(
                                "acquisitionType",
                                e.currentTarget.value,
                              );
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

            {/* --- Row 5 (ตัวเลข แบ่ง 3 ส่วน หรือ ซ้ายขวาผสม) --- */}
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
                rules={[
                  {
                    required: true,
                    message: "ระบุค่าเสื่อม",
                  },
                ]}
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

            {/* --- Row 6 (หมายเหตุ) --- */}
            <Col span={24}>
              <Form.Item label="หมายเหตุ" name="note" className="mb-2">
                <Input.TextArea
                  rows={2}
                  className={textAreaStyle}
                  placeholder="หมายเหตุ (ถ้ามี)"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ปุ่มด้านล่าง */}
          <div className="flex flex-row justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button
              onClick={onClose}
              className="h-10 flex-1 sm:flex-none px-6 rounded-lg text-gray-600 hover:bg-gray-100 border-gray-300"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="h-10 flex-1 sm:flex-none px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0"
            >
              บันทึก
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
}
