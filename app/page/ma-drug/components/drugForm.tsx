"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Card,
  Select,
  Row,
  Col,
  Space,
  Divider,
} from "antd";
import { SaveOutlined, ClearOutlined } from "@ant-design/icons"; // เพิ่ม Icon เพื่อความสวยงาม
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType, MasterDrugType } from "../../common";

interface DrugFormProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setData: React.Dispatch<React.SetStateAction<DrugType[]>>;
}

export default function DrugForm({
  setLoading,
  loading,
  setData,
}: DrugFormProps) {
  const [form] = Form.useForm();
  const [masterDrugOptions, setMasterDrugOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  // โหลด MasterDrug มาทำเป็น dropdown
  useEffect(() => {
    const fetchMasterDrug = async () => {
      try {
        const res: MasterDrugType[] =
          await intraAuthService.getMasterDrugQuery();
        if (Array.isArray(res)) {
          setMasterDrugOptions(
            res.map((item) => ({
              label: item.drugType, // หรือ item.description ถ้าต้องการรายละเอียดเพิ่ม
              value: item.id,
            }))
          );
        }
      } catch (error) {
        console.error(error);
        message.error("ไม่สามารถโหลดประเภทยาได้");
      }
    };

    fetchMasterDrug();
  }, []);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      // แปลงค่า number ให้แน่ใจว่าเป็น number จริงๆ ก่อนส่ง
      const payload = {
        ...values,
        price: Number(values.price),
        quantity: Number(values.quantity),
      };

      const newDrug: DrugType = await intraAuthService.createDrug(payload);
      setData((prev) => [newDrug, ...prev]); // เอาตัวใหม่ขึ้นบนสุด เพื่อให้ user เห็นทันที
      message.success("เพิ่มข้อมูลยาสำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("เพิ่มข้อมูลยาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <div
          style={{
            color: "#0683e9",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>💊 เพิ่มข้อมูลยาใหม่</span>
        </div>
      }
      bordered={false}
      className="shadow-md" // ถ้าใช้ Tailwind หรือ CSS global
      style={{ maxWidth: 800, margin: "0 auto", borderRadius: "8px" }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ quantity: 0, price: 0 }} // กำหนดค่าเริ่มต้น
      >
        {/* ส่วนข้อมูลหลัก */}
        <Divider orientation="left" style={{ marginTop: 0 }}>
          ข้อมูลทั่วไป
        </Divider>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Working Code (รหัสยา)"
              name="workingCode"
              rules={[{ required: true, message: "กรุณากรอก Working Code" }]}
            >
              <Input placeholder="เช่น W-001" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="ประเภทยา"
              name="drugTypeId"
              rules={[{ required: true, message: "กรุณาเลือกประเภทยา" }]}
            >
              <Select
                placeholder="-- เลือกประเภทยา --"
                options={masterDrugOptions}
                loading={masterDrugOptions.length === 0}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="ชื่อยา (Generic / Trade Name)"
          name="name"
          rules={[{ required: true, message: "กรุณากรอกชื่อยา" }]}
        >
          <Input placeholder="ระบุชื่อยาภาษาไทย หรือ อังกฤษ" />
        </Form.Item>

        {/* ส่วนข้อมูลคลังและราคา */}
        <Divider orientation="left">รายละเอียดคลังและราคา</Divider>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="ขนาดบรรจุ (Packaging Size)"
              name="packagingSize"
              rules={[{ required: true, message: "ระบุขนาดบรรจุ" }]}
            >
              <Input placeholder="เช่น แผง/กล่อง" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="ราคาต่อหน่วย (บาท)"
              name="price"
              rules={[{ required: true, message: "ระบุราคา" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                step={0.01}
                formatter={(value) =>
                  `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                // แก้ไขบรรทัดนี้: ลบ as unknown as number ออก
                parser={(value: any) => value?.replace(/\฿\s?|(,*)/g, "") || ""}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="จำนวนคงเหลือเริ่มต้น"
              name="quantity"
              rules={[{ required: true, message: "ระบุจำนวน" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="หมายเหตุ" name="note">
          <Input.TextArea rows={3} placeholder="ระบุข้อมูลเพิ่มเติม (ถ้ามี)" />
        </Form.Item>

        <Divider />

        <Form.Item style={{ textAlign: "right" }}>
          <Space>
            <Button
              icon={<ClearOutlined />}
              onClick={() => form.resetFields()}
              disabled={loading}
            >
              ล้างค่า
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              บันทึกข้อมูลยา
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
