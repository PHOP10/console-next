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
} from "antd";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";

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

  return (
    <Card
      title={
        <div
          style={{
            width: "100%",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 20,
            color: "#0683e9",
          }}
        >
          เพิ่มครุภัณฑ์
        </div>
      }
    >
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
              label="เลขที่หรือรหัส"
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
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
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
              label="ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ"
              name="description"
              rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>
        {/* ✅ ฟิลด์ใหม่ */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ประเภท"
              name="category"
              rules={[{ required: true, message: "กรุณาเลือกประเภท" }]}
            >
              <Select
                placeholder="เลือกประเภท"
                options={[
                  {
                    label: "ครุภัณฑ์งานบ้านงานครัว",
                    value: "ครุภัณฑ์งานบ้านงานครัว",
                  },
                  {
                    label: "ครุภัณฑ์วิทยาศาสตร์การแพทย์",
                    value: "ครุภัณฑ์วิทยาศาสตร์การแพทย์",
                  },
                  { label: "ครุภัณฑ์สำนักงาน", value: "ครุภัณฑ์สำนักงาน" },
                  {
                    label: "ครุภัณฑ์ยานพาหนะและขนส่ง",
                    value: "ครุภัณฑ์ยานพาหนะและขนส่ง",
                  },
                  {
                    label: "ครุภัณฑ์ไฟฟ้าและวิทยุ",
                    value: "ครุภัณฑ์ไฟฟ้าและวิทยุ",
                  },
                  {
                    label: "ครุภัณฑ์โฆษณาและเผยแพร่",
                    value: "ครุภัณฑ์โฆษณาและเผยแพร่",
                  },
                  {
                    label: "ครุภัณฑ์คอมพิวเตอร์",
                    value: "ครุภัณฑ์คอมพิวเตอร์",
                  },
                  { label: "ครุภัณฑ์การแพทย์", value: "ครุภัณฑ์การแพทย์" },
                  { label: "ครุภัณฑ์ก่อสร้าง", value: "ครุภัณฑ์ก่อสร้าง" },
                  { label: "ครุภัณฑ์อื่น", value: "ครุภัณฑ์อื่น" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="ที่เอกสาร"
              name="documentId"
              rules={[{ required: true, message: "กรุณากรอกที่เอกสาร" }]}
            >
              <Input placeholder="กรอกที่เอกสาร" />
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
              label="วิธีการได้มา"
              name="acquisitionType"
              rules={[{ required: true, message: "กรุณาเลือกวิธีการได้มา" }]}
            >
              <Select placeholder="เลือกวิธีการได้มา">
                <Select.Option value="งบประมาณ">งบประมาณ</Select.Option>
                <Select.Option value="เงินบำรุง">เงินบำรุง</Select.Option>
                <Select.Option value="เงินงบประมาณ ตกลงราคา">
                  เงินงบประมาณ ตกลงราคา
                </Select.Option>
                <Select.Option value="บริจาค">บริจาค</Select.Option>
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
          <Button type="primary" htmlType="submit">
            บันทึก
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
