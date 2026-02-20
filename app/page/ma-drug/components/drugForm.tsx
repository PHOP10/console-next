"use client";

import React from "react";
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
  AutoComplete,
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { MaDrug } from "../services/maDrug.service";
import { DrugType, MasterDrugType } from "../../common";
import { packingOptions } from "@/app/common";

interface DrugFormProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setData: React.Dispatch<React.SetStateAction<DrugType[]>>;
  masterDrugs: MasterDrugType[]; // ✅ รับค่ามาจากหน้า Page
}

export default function DrugForm({
  setLoading,
  loading,
  setData,
  masterDrugs,
}: DrugFormProps) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = MaDrug(intraAuth);

  // ✅ แปลง MasterDrugType ที่ได้จาก Props ให้เป็น Option สำหรับ Select
  const masterDrugOptions = masterDrugs.map((item) => ({
    label: item.drugType,
    value: item.drugTypeId,
  }));

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const payload = {
        ...values,
        price: Number(values.price),
        quantity: 0,
      };

      const newDrug: DrugType = await intraAuthService.createDrug(payload);
      setData((prev) => [newDrug, ...prev]);
      message.success("เพิ่มข้อมูลยาสำเร็จ");
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("เพิ่มข้อมูลยาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // --- Styles ---
  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";
  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";
  const autoCompleteStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400 focus-within:[&>.ant-select-selector]:!border-blue-500 focus-within:[&>.ant-select-selector]:!ring-4 focus-within:[&>.ant-select-selector]:!ring-blue-50 focus-within:[&>.ant-select-selector]:!shadow-md";

  return (
    <Card
      className="shadow-lg rounded-2xl border-gray-100 overflow-hidden"
      style={{ maxWidth: 800, margin: "0 auto" }}
      title={
        <div className="text-2xl font-bold text-[#0683e9] text-center py-2">
          เพิ่มข้อมูลยา
        </div>
      }
    >
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ price: 0 }}
        >
          {/* Row 1: รหัสยา, ประเภทยา */}
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Working Code (รหัสยา)"
                name="workingCode"
                rules={[{ required: true, message: "กรุณากรอก Working Code" }]}
              >
                <Input
                  placeholder="กรอกรหัสยา"
                  className={inputStyle}
                  maxLength={10}
                />
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
                  options={masterDrugOptions} // ✅ เรียกใช้ Option ที่แปลงร่างมาแล้ว
                  loading={masterDrugOptions.length === 0}
                  showSearch
                  optionFilterProp="label"
                  className={selectStyle}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 2: ชื่อยา */}
          <Form.Item
            label="ชื่อยา"
            name="name"
            rules={[{ required: true, message: "กรุณากรอกชื่อยา" }]}
          >
            <Input
              placeholder="ระบุชื่อยาภาษาไทย หรือ อังกฤษ"
              className={inputStyle}
            />
          </Form.Item>

          {/* Row 3: ขนาดบรรจุ, ราคา */}
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="ขนาดบรรจุ"
                name="packagingSize"
                rules={[{ required: true, message: "ระบุขนาดบรรจุ" }]}
              >
                <AutoComplete
                  options={packingOptions}
                  placeholder="เช่น แผง/กล่อง หรือพิมพ์ระบุเอง"
                  filterOption={(inputValue, option) =>
                    option!.value
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                  allowClear
                  className={autoCompleteStyle}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
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
                  parser={(value: any) =>
                    value?.replace(/\฿\s?|(,*)/g, "") || ""
                  }
                  className={`${inputStyle} pt-1`}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea
              rows={3}
              placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
              className={textAreaStyle}
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="h-9 px-6 rounded-lg text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center bg-[#0683e9] border-none"
              >
                บันทึกข้อมูลยา
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Card>
  );
}
