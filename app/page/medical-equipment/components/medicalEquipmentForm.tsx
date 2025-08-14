"use client";

import React from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Space,
  message,
  Card,
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import dayjs from "dayjs";

const { TextArea } = Input;

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CreateMedicalEquipmentForm({ setLoading }: Props) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const service = maMedicalEquipmentServices(intraAuth);

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        sentDate: values.sentDate.toISOString(),
        receivedDate: values.receivedDate
          ? values.receivedDate.toISOString()
          : null,
      };

      await service.createMaMedicalEquipment(payload);
      setLoading(true);
      message.success("บันทึกข้อมูลสำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      message.error("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  return (
    <Card title="ส่งเครื่องมือแพทย์" style={{ marginTop: 20 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: "WaitingApproval", // ตั้งสถานะเริ่มต้น
        }}
      >
        <Form.List name="equipmentInfo">
          {(fields, { add, remove }) => (
            <>
              <label>ข้อมูลเครื่องมือ</label>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={name}
                    rules={[
                      { required: true, message: "กรอกข้อมูลเครื่องมือ" },
                    ]}
                  >
                    <Input placeholder="ชื่อเครื่องมือ เช่น กรรไกร" />
                  </Form.Item>
                  <Button danger onClick={() => remove(name)}>
                    ลบ
                  </Button>
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block>
                  + เพิ่มรายการเครื่องมือ
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item
          label="จำนวน"
          name="quantity"
          rules={[{ required: true, message: "กรุณากรอกจำนวน" }]}
        >
          <InputNumber min={1} />
        </Form.Item>

        <Form.Item
          label="วันที่ส่ง"
          name="sentDate"
          rules={[{ required: true, message: "กรุณาเลือกวันที่ส่ง" }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="หมายเหตุ" name="note">
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            บันทึกข้อมูล
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
