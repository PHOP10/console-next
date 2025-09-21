"use client";

import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Select,
  message,
  Card,
  Table,
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType } from "../../common";

interface MaDrugFormProps {
  drugs: DrugType[];
  refreshData: () => void;
}

interface DrugItemRow {
  key: number;
  drugId: number | null;
  quantity: number;
  note: string;
}

export default function MaDrugForm({ drugs, refreshData }: MaDrugFormProps) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);
  const [loading, setLoading] = useState(false);

  const [dataSource, setDataSource] = useState<DrugItemRow[]>([
    { key: Date.now(), drugId: null, quantity: 1, note: "" },
  ]);

  const onFinish = async (values: any) => {
    if (dataSource.length === 0) {
      message.error("กรุณาเพิ่มรายการยาอย่างน้อย 1 รายการ");
      return;
    }

    // ตรวจสอบว่าเลือกยาเรียบร้อย
    for (let item of dataSource) {
      if (!item.drugId || item.quantity < 1) {
        message.error("กรุณาเลือกยาและกรอกจำนวนให้ถูกต้องทุกแถว");
        return;
      }
    }

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
        status: "pending",
        maDrugItems: dataSource.map((item) => ({
          drugId: item.drugId,
          quantity: item.quantity,
          note: item.note,
        })),
      };

      console.log(payload);
      await intraAuthService.createMaDrug(payload);
      message.success("บันทึกการเบิกยาสำเร็จ");
      form.resetFields();
      setDataSource([{ key: Date.now(), drugId: null, quantity: 1, note: "" }]);
      refreshData();
    } catch (error) {
      console.error(error);
      message.error("บันทึกข้อมูลล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ยา",
      dataIndex: "drugId",
      render: (value: number, record: DrugItemRow) => (
        <Select
          value={value}
          placeholder="เลือกยา"
          style={{ width: 200 }}
          onChange={(val) => {
            const newData = [...dataSource];
            const index = newData.findIndex((item) => item.key === record.key);
            newData[index].drugId = val;
            setDataSource(newData);
          }}
        >
          {drugs.map((drug) => (
            <Select.Option key={drug.id} value={drug.id}>
              {drug.name} ({drug.packagingSize})
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      render: (value: number, record: DrugItemRow) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => {
            const newData = [...dataSource];
            const index = newData.findIndex((item) => item.key === record.key);
            newData[index].quantity = val || 1;
            setDataSource(newData);
          }}
        />
      ),
    },
    {
      title: "หมายเหตุ",
      dataIndex: "note",
      render: (value: string, record: DrugItemRow) => (
        <Input
          value={value}
          placeholder="หมายเหตุ"
          onChange={(e) => {
            const newData = [...dataSource];
            const index = newData.findIndex((item) => item.key === record.key);
            newData[index].note = e.target.value;
            setDataSource(newData);
          }}
        />
      ),
    },
    {
      title: "ลบ",
      render: (_: any, record: DrugItemRow) => (
        <Button
          danger
          onClick={() => {
            setDataSource(dataSource.filter((item) => item.key !== record.key));
          }}
        >
          ลบ
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <div
          style={{
            fontSize: "20px",
            textAlign: "center",
            fontWeight: "bold",
            color: "#0683e9",
          }}
        >
          ทำรายการเบิกจ่ายยา
        </div>
      }
    >
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

        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          rowKey="key"
          style={{ marginBottom: 16 }}
        />

        <Button
          type="dashed"
          block
          onClick={() =>
            setDataSource([
              ...dataSource,
              { key: Date.now(), drugId: null, quantity: 1, note: "" },
            ])
          }
        >
          เพิ่มรายการยา
        </Button>

        <Form.Item style={{ textAlign: "center", marginTop: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            บันทึกข้อมูล
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
