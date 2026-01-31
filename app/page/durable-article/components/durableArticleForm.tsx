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

  // สร้าง Ref แยกกันสำหรับ Select 2 ตัว เพื่อสั่งปิด Dropdown อิสระต่อกัน
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

      setLoading(true); // เริ่ม Loading
      await intraAuthService.createDurableArticle(payload);

      message.success("บันทึกข้อมูลครุภัณฑ์สำเร็จ");

      // *** สำคัญ: รอให้ fetchData เสร็จก่อน ***
      await fetchData();

      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      // ปิด Loading เสมอ ไม่ว่าจะสำเร็จหรือพัง
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
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

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
          {/* --- Row 1: รหัส | เลขที่เอกสาร | หมายเลขและทะเบียน --- */}
          <Row gutter={24}>
            <Col xs={24} md={8}>
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

            <Col xs={24} md={8}>
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

            <Col xs={24} md={8}>
              <Form.Item label="หมายเลขและทะเบียน" name="registrationNumber">
                <Input
                  placeholder="กรอกหมายเลขและทะเบียน"
                  className={inputStyle}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* --- Row 2: ชื่อ ยี่ห้อ... | สถานที่ตั้ง --- */}
          <Row gutter={24}>
            <Col xs={24} md={12}>
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

            <Col xs={24} md={12}>
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

          {/* --- Row 3: ประเภท | ชื่อผู้ขาย... --- */}
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="ประเภท"
                name="category"
                rules={[{ required: true, message: "กรุณาเลือกประเภท" }]}
              >
                <Select
                  ref={categoryRef} // ใช้ ref
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
                            categoryRef.current?.blur(); // ปิด Dropdown
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

            <Col xs={24} md={12}>
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

          {/* --- Row 4: วิธีการได้มา | วันที่ได้มา --- */}
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="acquisitionType"
                label="วิธีการได้มา"
                rules={[{ required: true, message: "กรุณาเลือกวิธีการได้มา" }]}
              >
                <Select
                  ref={acquisitionRef} // ใช้ ref แยกต่างหาก
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
                            acquisitionRef.current?.blur(); // ปิด Dropdown
                          }}
                          // เพิ่ม onBlur เพื่อเซ็ตค่ากรณีพิมพ์แล้วคลิกออกเลย
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
                    เงินงบประมาณ ตกลงราคา
                  </Select.Option>
                  <Select.Option value="สนับสนุน">สนับสนุน</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
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

          {/* --- Row 5: ราคา | ค่าเสื่อม | อายุการใช้งาน --- */}
          <Row gutter={24}>
            <Col xs={24} md={8}>
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

            <Col xs={24} md={8}>
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

          {/* --- Row 6: หมายเหตุ --- */}
          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea
              rows={2}
              className={textAreaStyle}
              placeholder="กรอกหมายเหตุ (ถ้ามี)"
            />
          </Form.Item>

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
