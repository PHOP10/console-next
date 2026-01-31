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

interface DurableArticleEditModalProps {
  open: boolean;
  onClose: () => void; // ใช้ฟังก์ชันนี้ฟังก์ชันเดียวในการปิด
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

  // Refs สำหรับปิด Select Dropdown
  const categoryRef = useRef<any>(null);
  const acquisitionRef = useRef<any>(null);

  useEffect(() => {
    if (open && record) {
      form.setFieldsValue({
        ...record,
        acquiredDate: record.acquiredDate ? dayjs(record.acquiredDate) : null,
      });
    }
    // ไม่ต้อง resetFields ใน else เพราะเราใช้ key ที่ Parent จัดการล้างค่าให้แล้ว
  }, [open, record, form]);

  const handleUpdate = async (values: any) => {
    if (!record) return;

    setLoading(true); // หมุนปุ่ม

    try {
      const payload = {
        ...values,
        id: record.id,
        acquiredDate: values.acquiredDate
          ? values.acquiredDate.toISOString()
          : null,
      };

      // 1. ยิง API บันทึก (ถ้าพังจะกระโดดไป catch)
      await intraAuthService.updateDurableArticle(payload);

      message.success("แก้ไขข้อมูลสำเร็จ");
    } catch (error) {
      console.error("Error updating:", error);
      message.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
      setLoading(false); // หยุดหมุนเฉพาะเมื่อ Error
      return; // จบการทำงาน ไม่ปิด Modal
    }
    onClose();
    // 3. สั่ง Refresh ข้อมูลเงียบๆ ข้างหลัง
    try {
      await fetchData();
    } catch (refreshError) {
      console.warn("Refresh failed:", refreshError);
    }

    // ไม่ต้อง setLoading(false) เพราะ Modal ถูกปิดไปแล้ว (Unmount)
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
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";
  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";
  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  return (
    <Modal
      title={
        <div className="text-xl font-bold text-[#0683e9] text-center w-full">
          แก้ไขข้อมูลครุภัณฑ์
        </div>
      }
      open={open}
      onCancel={onClose} // กดปุ่ม X หรือคลิกข้างนอก ก็เรียก onClose
      footer={null}
      width={900}
      centered
      destroyOnClose
      styles={{
        content: { borderRadius: "20px", padding: "24px" },
        header: {
          marginBottom: "16px",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "12px",
        },
      }}
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          {/* --- Row 1 --- */}
          <Row gutter={24}>
            <Col span={8}>
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
                    if (!/[0-9/-]/.test(e.key)) e.preventDefault();
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="เลขที่เอกสาร"
                name="documentId"
                rules={[
                  { required: true, message: "กรุณากรอกเลขที่เอกสาร" },
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
            <Col span={8}>
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
          </Row>

          {/* --- Row 2 --- */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="ชื่อ ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ"
                name="description"
                rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
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
            <Col span={12}>
              <Form.Item
                label="สถานที่ตั้ง/ที่อยู่"
                name="location"
                rules={[{ required: true, message: "กรุณาระบุสถานที่ตั้ง" }]}
              >
                <Input.TextArea
                  placeholder="กรอกสถานที่ตั้ง/ที่อยู่"
                  className={inputStyle}
                  maxLength={150}
                  style={{ minHeight: "44px" }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* --- Row 3 --- */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="ประเภท"
                name="category"
                rules={[{ required: true, message: "กรุณาเลือกประเภท" }]}
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
                          placeholder="กรอกประเภทอื่นๆ"
                          className="rounded-lg"
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
                </Select>
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
                  className={inputStyle}
                  placeholder="ระบุชื่อผู้ขาย/ผู้รับจ้าง/ผู้บริจาค"
                  maxLength={150}
                  style={{ minHeight: "44px" }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* --- Row 4 --- */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="acquisitionType"
                label="วิธีการได้มา"
                rules={[{ required: true, message: "กรุณาเลือกวิธีการได้มา" }]}
              >
                <Select
                  ref={acquisitionRef}
                  placeholder="เลือกงบประมาณ"
                  className={selectStyle}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ display: "flex", padding: 8 }}>
                        <Input
                          placeholder="กรอกงบประมาณอื่นๆ"
                          className="rounded-lg"
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
                    เงินงบประมาณ ตกลงราคา
                  </Select.Option>
                  <Select.Option value="สนับสนุน">สนับสนุน</Select.Option>
                </Select>
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

          {/* --- Row 5 --- */}
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="ราคาต่อหน่วย"
                name="unitPrice"
                rules={[{ required: true, message: "กรุณากรอกราคาต่อหน่วย" }]}
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
            <Col span={8}>
              <Form.Item
                label="ค่าเสื่อมราคาต่อเดือน"
                name="monthlyDepreciation"
                rules={[
                  { required: true, message: "กรุณากรอกค่าเสื่อมราคาต่อเดือน" },
                ]}
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
            <Col span={8}>
              <Form.Item
                label="อายุการใช้งาน (ปี)"
                name="usageLifespanYears"
                rules={[{ required: true, message: "กรุณากรอกอายุการใช้งาน" }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-1`}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* --- Row 6 --- */}
          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea
              rows={2}
              className={textAreaStyle}
              placeholder="กรอกหมายเหตุ (ถ้ามี)"
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              onClick={onClose}
              className="h-10 px-6 rounded-lg text-gray-600 hover:bg-gray-100 border-gray-300"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0 flex items-center"
            >
              บันทึกแก้ไข
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
}
