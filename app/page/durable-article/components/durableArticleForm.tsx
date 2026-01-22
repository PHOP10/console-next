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
  Space,
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

export default function DurableArticleForm({ setLoading, loading }: Props) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);
  const { data: session } = useSession();

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        acquiredDate: values.acquiredDate
          ? values.acquiredDate.toISOString()
          : null,
        type: "durableArticles",
        createdName: session?.user?.fullName || null,
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


/*  ----------------------------------------- ข้อมูลตัวอย่าง/------------------------------------------ */


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
          <Row gutter={16}>
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
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
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
                <Input placeholder="กรอกเลขที่เอกสาร" maxLength={14} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="ชื่อ ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ"
                name="description"
                rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="หมายเลขและทะเบียน"
                name="registrationNumber"
                rules={[{ required: true, message: "กรุณาหมายเลขและทะเบียน" }]}
              >
                <Input placeholder="กรอกหมายเลขและทะเบียน" />
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="ลักษณะ/คุณสมบัติ"
                name="attributes"
                rules={[{ required: true, message: "กรุณากรอกคุณสมบัติ" }]}
              >
                <Input.TextArea rows={2} placeholder="กรอกลักษณะ/คุณสมบัติ " />
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
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="ราคาต่อหน่วย"
                name="unitPrice"
                rules={[{ required: true, message: "กรุณากรอกราคาต่อหน่วย" }]}
              >
                <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="อายุการใช้งาน (ปี)"
                name="usageLifespanYears"
                rules={[{ required: true, message: "กรุณากรอกอายุการใช้งาน" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="ค่าเสื่อมราคาต่อเดือน"
                name="monthlyDepreciation"
                rules={[
                  { required: true, message: "กรุณากรอกค่าเสื่อมราคาต่อเดือน" },
                ]}
              >
                <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item style={{ textAlign: "center" }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{
                width: "100%",
                maxWidth: "200px",
                height: "50px",
                fontSize: "16px",
              }}
            >
             บันทึก
            </Button>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </Card>
  );
}
