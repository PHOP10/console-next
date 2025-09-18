"use client";

import React from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Space,
  Card,
  Row,
  Col,
  Select,
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { infectiousWasteServices } from "../services/durableArticle.service";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
};

export default function SupportingResourceForm({ setLoading, loading }: Props) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = infectiousWasteServices(intraAuth);
  const { data: session } = useSession();
  const pathname = usePathname();

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        acquiredDate: values.acquiredDate
          ? values.acquiredDate.toISOString()
          : null,
        createdBy: session?.user.fullName,
        createdById: session?.user.userId,
      };
      await intraAuthService.createSupportingResource(payload);
      setLoading(true);
      message.success("บันทึกข้อมูลวัสดุสนับสนุนสำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error(error);
      setLoading(false);
      message.error("บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, []);

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
          เพิ่มวัสดุสนับสนุน
        </div>
      }
    >
      <Form
        preserve={false}
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: "พร้อมใช้งาน",
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
              label="วันที่ได้รับ"
              name="acquiredDate"
              rules={[{ required: true, message: "กรุณาเลือกวันที่ได้รับ" }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="ยี่ห้อ ชนิด แบบ ขนาดและลักษณะ"
          name="name"
          rules={[{ required: true, message: "กรุณากรอกชื่อวัสดุ" }]}
        >
          <Input.TextArea
            rows={2}
            placeholder="กรอกยี่ห้อ ชนิด แบบ ขนาดและลักษณะ"
          />
        </Form.Item>

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

        {/* ✅ ฟิลด์ใหม่ */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ประเภท"
              name="category"
              rules={[{ required: true, message: "กรุณากรอกประเภท" }]}
            >
              <Input placeholder="กรอกประเภท" />
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

        <Form.Item label="หมายเหตุ" name="description">
          <Input.TextArea rows={2} placeholder="กรอกหมายเหตุ" />
        </Form.Item>

        <Form.Item style={{ textAlign: "center" }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            บันทึก
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
