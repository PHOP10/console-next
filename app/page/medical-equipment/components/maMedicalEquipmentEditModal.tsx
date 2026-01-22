"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Input,
  Button,
  Space,
  message,
  Row,
  Col,
  ConfigProvider,
} from "antd";
import dayjs from "dayjs";
import th_TH from "antd/locale/th_TH";
import {
  MaMedicalEquipmentType,
  MedicalEquipmentType,
} from "../../common/index";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";

const { Option } = Select;
const { TextArea } = Input;

interface MaMedicalEquipmentEditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: MaMedicalEquipmentType | null;
  dataEQ: MedicalEquipmentType[]; // ข้อมูลเครื่องมือแพทย์ทั้งหมดสำหรับ Dropdown
}

export default function MaMedicalEquipmentEditModal({
  open,
  onClose,
  onSuccess,
  record,
  dataEQ,
}: MaMedicalEquipmentEditModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const intraAuth = useAxiosAuth();
  const intraAuthService = maMedicalEquipmentServices(intraAuth);

  // เมื่อเปิด Modal หรือเปลี่ยน record ให้ set ค่าเข้า Form
  useEffect(() => {
    if (open && record) {
      const equipmentInfo =
        record.items?.map((i: any) => ({
          medicalEquipmentId: i.medicalEquipmentId,
          quantity: i.quantity,
        })) || [];

      form.setFieldsValue({
        equipmentInfo,
        sentDate: record.sentDate ? dayjs(record.sentDate) : null,
        note: record.note || "",
      });
    } else {
      form.resetFields();
    }
  }, [open, record, form]);

  const onFinish = async (values: any) => {
    if (!record) return;

    try {
      setLoading(true);
      const payload = {
        id: record.id,
        sentDate: values.sentDate?.toISOString(),
        note: values.note,
        items: values.equipmentInfo.map((eq: any) => ({
          medicalEquipmentId: eq.medicalEquipmentId,
          quantity: eq.quantity,
        })),
      };

      await intraAuthService.updateMedicalEquipmentEdit(payload);

      message.success("บันทึกการแก้ไขเรียบร้อย");
      onSuccess(); // แจ้ง Parent ให้ Refresh Data
      onClose(); // ปิด Modal
    } catch (error) {
      console.error("อัปเดตข้อมูลไม่สำเร็จ:", error);
      message.error("ไม่สามารถอัปเดตข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  // --- Style Constants ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";
  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";
  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  return (
    <Modal
      title={
        <div className="text-xl font-bold text-[#0683e9] text-center w-full">
          แก้ไขข้อมูลการเบิกเครื่องมือแพทย์
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      destroyOnClose
      styles={{
        content: { borderRadius: "20px", padding: "24px" },
        header: {
          marginBottom: "16px",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "12px",
        },
      }}
    >
      <ConfigProvider locale={th_TH}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ equipmentInfo: [] }}
        >
          {/* ส่วน Dynamic List (รายการเครื่องมือ) */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
            <div className="mb-3 font-semibold text-gray-700">
              รายการเครื่องมือที่เบิก
            </div>
            <Form.List name="equipmentInfo">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={12} align="middle" className="mb-2">
                      <Col flex="auto">
                        <Form.Item
                          {...restField}
                          name={[name, "medicalEquipmentId"]}
                          rules={[
                            { required: true, message: "กรุณาเลือกเครื่องมือ" },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            placeholder="เลือกเครื่องมือ"
                            className={selectStyle}
                            showSearch
                            optionFilterProp="children"
                          >
                            {dataEQ.map((eq) => {
                              // Logic คำนวณจำนวนคงเหลือ (เหมือนเดิม)
                              // หมายเหตุ: การคำนวณแบบ Realtime อาจจะต้องพิจารณา Performance
                              // ในที่นี้คง Logic เดิมไว้
                              const selectedIds = (
                                form.getFieldValue("equipmentInfo") ?? []
                              )
                                .filter((i: any) => i)
                                .map((i: any) => i.medicalEquipmentId)
                                .filter((id: any) => id !== undefined);

                              const isSelected =
                                selectedIds.includes(eq.id) &&
                                eq.id !==
                                  form.getFieldValue([
                                    "equipmentInfo",
                                    name,
                                    "medicalEquipmentId",
                                  ]);

                              return (
                                <Option
                                  key={eq.id}
                                  value={eq.id}
                                  disabled={isSelected}
                                >
                                  {eq.equipmentName} (คงเหลือ {eq.quantity})
                                </Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col flex="120px">
                        <Form.Item
                          {...restField}
                          name={[name, "quantity"]}
                          rules={[
                            { required: true, message: "ระบุจำนวน" },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const equipmentId = getFieldValue([
                                  "equipmentInfo",
                                  name,
                                  "medicalEquipmentId",
                                ]);
                                if (!equipmentId) return Promise.resolve();
                                const selected = dataEQ.find(
                                  (eq) => eq.id === equipmentId
                                );
                                if (value > (selected?.quantity || 0)) {
                                  return Promise.reject(
                                    new Error(
                                      `เกินคงเหลือ (${selected?.quantity})`
                                    )
                                  );
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber
                            min={1}
                            placeholder="จำนวน"
                            className={`${inputStyle} pt-1`}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                      <Col flex="none">
                        <Button
                          danger
                          onClick={() => remove(name)}
                          className="flex items-center justify-center rounded-lg border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300"
                          icon={
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          }
                        />
                      </Col>
                    </Row>
                  ))}
                  <Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      className="h-10 rounded-xl border-blue-300 text-blue-500 hover:border-blue-500 hover:text-blue-600 bg-blue-50/50"
                    >
                      + เพิ่มรายการเครื่องมือ
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          {/* วันที่ส่ง และ หมายเหตุ */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="วันที่ส่ง"
                name="sentDate"
                rules={[{ required: true, message: "กรุณาเลือกวันที่ส่ง" }]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-2`}
                  placeholder="เลือกวันที่"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* ถ้ามี field อื่นๆ เพิ่มตรงนี้ได้ */}
            </Col>
          </Row>

          <Form.Item label="หมายเหตุ" name="note">
            <TextArea
              rows={3}
              placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
              className={textAreaStyle}
            />
          </Form.Item>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              onClick={onClose}
              className="h-10 px-6 rounded-lg text-gray-600 hover:bg-gray-100 border-gray-300"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0"
            >
              บันทึกการแก้ไข
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
}