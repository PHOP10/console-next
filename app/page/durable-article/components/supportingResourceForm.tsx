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

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();

    // อนุญาตเฉพาะตัวเลข, / และ -
    value = value.replace(/[^0-9/-]/g, "");

    // ถ้ามี "/" → แยกส่วน main และ suffix
    const parts = value.split("/");
    let main = parts[0].replace(/-/g, ""); // เอาเฉพาะเลขก่อน

    // ใส่ "-" ทุก ๆ 4 ตัวอักษร (เช่น 4140-0010-0012)
    main = main.match(/.{1,4}/g)?.join("-") || main;

    // ถ้ามี suffix ต่อท้ายด้วย "/"
    value = parts[1] ? `${main}/${parts[1]}` : main;

    form.setFieldsValue({ code: value });
  };

  return (
    <Card title="ข้อมูลวัสดุสนับสนุน">
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
              label="รหัสครุภัณฑ์"
              name="code"
              rules={[
                { required: true, message: "กรุณากรอกรหัสครุภัณฑ์" },
                {
                  pattern: /^[0-9/-]+$/,
                  message: "กรุณากรอกเฉพาะตัวเลข, /, - และต้องมี 13 ตัวอักษร",
                },
              ]}
            >
              <Input placeholder="เช่น 4140-0010-0001" maxLength={15} />
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
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item
          label="วิธีการได้มา"
          name="acquisitionType"
          rules={[{ required: true, message: "กรุณากรอกวิธีการได้มา" }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item label="หมายเหตุ" name="description">
          <Input.TextArea rows={2} />
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
