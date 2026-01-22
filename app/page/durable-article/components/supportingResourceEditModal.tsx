"use client";

import React, { useEffect, useState } from "react";
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

interface SupportingResourceEditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: DurableArticleType | null;
}

export default function SupportingResourceEditModal({
  open,
  onClose,
  onSuccess,
  record,
}: SupportingResourceEditModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);

  useEffect(() => {
    if (open && record) {
      form.setFieldsValue({
        ...record,
        acquiredDate: record.acquiredDate ? dayjs(record.acquiredDate) : null,
        // แปลง category ถ้าจำเป็น (เช่นถ้าใน db เก็บเป็นค่าอื่น)
      });
    } else {
      form.resetFields();
    }
  }, [open, record, form]);

  const handleUpdate = async (values: any) => {
    if (!record) return;
    try {
      setLoading(true);
      const payload = {
        ...values,
        id: record.id,
        acquiredDate: values.acquiredDate
          ? values.acquiredDate.toISOString()
          : null,
      };

      await intraAuthService.updateDurableArticle(payload);
      message.success("แก้ไขข้อมูลสำเร็จ");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating:", error);
      message.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // --- Style Constants (Master Template) ---
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
          แก้ไขข้อมูลวัสดุสนับสนุน
        </div>
      }
      open={open}
      onCancel={onClose}
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
          {/* Row 1: รหัส, วันที่ */}
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
                    if (!/[0-9/-]/.test(e.key)) e.preventDefault();
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
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-2`}
                  placeholder="เลือกวันที่"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 2: เอกสาร, รายละเอียด */}
          <Row gutter={24}>
            <Col span={12}>
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
            <Col span={12}>
              <Form.Item
                label="ชื่อ ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ"
                name="description"
                rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
              >
                <Input.TextArea
                  rows={2}
                  className={textAreaStyle}
                  placeholder="รายละเอียด..."
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 3: ประเภท (วัสดุอาจไม่มีทะเบียนรถ) */}
          <Row gutter={24}>
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
          </Row>

          {/* Row 4: ผู้ขาย, ราคา */}
          <Row gutter={24}>
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
          </Row>

          {/* Row 5: วิธีได้มา, อายุงาน */}
          <Row gutter={24}>
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
                            form.setFieldValue(
                              "acquisitionType",
                              e.currentTarget.value,
                            );
                          }}
                          onBlur={(e) => {
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
                  <Select.Option value="other">อื่นๆ...</Select.Option>
                </Select>
              </Form.Item>
            </Col>
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
          </Row>

          {/* Row 6: ค่าเสื่อม */}
          <Row gutter={24}>
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
              className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0"
            >
              บันทึก
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
}
