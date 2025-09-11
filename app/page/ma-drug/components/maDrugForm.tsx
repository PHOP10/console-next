"use client";

import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Select,
  message,
  Card,
  Space,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType } from "../../common";

interface MaDrugFormProps {
  drugs: DrugType[];
  refreshData: () => void;
}

export default function MaDrugForm({ drugs, refreshData }: MaDrugFormProps) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const payload = {
        requestNumber: values.requestNumber,
        requestUnit: values.requestUnit,
        roundNumber: values.roundNumber,
        requesterName: values.requesterName,
        dispenserName: values.dispenserName,
        requestDate: values.requestDate.toISOString(),
        note: values.note,
        status: "PENDING", // default
        maDrugItems: values.maDrugItems.map((item: any) => ({
          drugId: item.drugId,
          quantity: item.quantity,
          note: item.note,
        })),
      };

      await intraAuthService.createMaDrug(payload);
      message.success("บันทึกการเบิกยาสำเร็จ");
      form.resetFields();
      refreshData();
    } catch (error) {
      console.error(error);
      message.error("บันทึกข้อมูลล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={
        <div style={{ fontSize: "20px", textAlign: "center", fontWeight: "bold" , color: "#0683e9"  }}>
          ทำรายการเบิกจ่ายยา
        </div>
      }>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ roundNumber: 1 }}
      >
        <Form.Item
          label="เลขที่เบิก"
          name="requestNumber"
          rules={[{ required: true, message: "กรุณากรอกเลขที่เบิก" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="หน่วยงานที่เบิก"
          name="requestUnit"
          rules={[{ required: true, message: "กรุณากรอกหน่วยงานที่เบิก" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="เบิกครั้งที่"
          name="roundNumber"
          rules={[{ required: true, message: "กรุณากรอกครั้งที่เบิก" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="ผู้ขอเบิก"
          name="requesterName"
          rules={[{ required: true, message: "กรุณากรอกชื่อผู้ขอเบิก" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="ผู้จัดยา"
          name="dispenserName"
          rules={[{ required: true, message: "กรุณากรอกชื่อผู้จัดยา" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="วันที่ขอเบิก"
          name="requestDate"
          rules={[{ required: true, message: "กรุณาเลือกวันที่ขอเบิก" }]}
        >
          <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="หมายเหตุ" name="note">
          <Input.TextArea rows={3} />
        </Form.Item>

        {/* รายการยาแบบ dynamic list */}
        <Form.List name="maDrugItems">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "drugId"]}
                    rules={[{ required: true, message: "กรุณาเลือกรายการยา" }]}
                  >
                    <Select placeholder="เลือกยา" style={{ width: 200 }}>
                      {drugs.map((drug) => (
                        <Select.Option key={drug.id} value={drug.id}>
                          {drug.name} ({drug.packagingSize})
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "quantity"]}
                    rules={[{ required: true, message: "กรุณากรอกจำนวน" }]}
                  >
                    <InputNumber min={1} placeholder="จำนวน" />
                  </Form.Item>

                  <Form.Item {...restField} name={[name, "note"]}>
                    <Input placeholder="หมายเหตุ" />
                  </Form.Item>

                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  เพิ่มรายการยา
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item style={{ textAlign: "center" }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            บันทึกข้อมูล
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
