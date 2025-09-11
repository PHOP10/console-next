"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, message, Card, Select } from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType, MasterDrugType } from "../../common";

interface DrugFormProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setData: React.Dispatch<React.SetStateAction<DrugType[]>>; // ✅ เพิ่ม type
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
          await intraAuthService.getMasterDrugQuery(); // ✅ ต้อง return array
        setMasterDrugOptions(
          res.map((item) => ({
            label: item.drugType,
            value: item.id,
          }))
        );
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
      const newDrug: DrugType = await intraAuthService.createDrug(values); // ✅ รับ response กลับมา
      setData((prev) => [...prev, newDrug]); // ✅ เพิ่มข้อมูลใหม่ในตาราง
      message.success("เพิ่มข้อมูลยาสำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("เพิ่มข้อมูลยาไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <div style={{ fontSize: "20px", textAlign: "center", fontWeight: "bold" , color: "#0683e9"  }}>
          เพิ่มข้อมูลยา
        </div>
      }
      bordered={false}
      style={{ maxWidth: 600, margin: "0 auto" }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Working Code"
          name="workingCode"
          rules={[{ required: true, message: "กรุณากรอก Working Code" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="ชื่อยา"
          name="name"
          rules={[{ required: true, message: "กรุณากรอกชื่อยา" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="ประเภทยา"
          name="drugTypeId"
          rules={[{ required: true, message: "กรุณาเลือกประเภทยา" }]}
        >
          <Select
            placeholder="เลือกประเภทยา"
            options={masterDrugOptions}
            loading={masterDrugOptions.length === 0}
          />
        </Form.Item>

        <Form.Item
          label="ขนาดบรรจุ"
          name="packagingSize"
          rules={[{ required: true, message: "กรุณากรอกขนาดบรรจุ" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="ราคา/หน่วย"
          name="price"
          rules={[{ required: true, message: "กรุณากรอกราคา" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
        </Form.Item>

        <Form.Item
          label="จำนวนคงเหลือ"
          name="quantity"
          rules={[{ required: true, message: "กรุณากรอกจำนวนคงเหลือ" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item label="หมายเหตุ" name="note">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item style={{ textAlign: "center" }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            บันทึกข้อมูลยา
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
