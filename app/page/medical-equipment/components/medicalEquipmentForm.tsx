"use client";

import React, { useEffect, useState } from "react";
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
const { Option } = Select;

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CreateMedicalEquipmentForm({ setLoading }: Props) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();

  const maService = maMedicalEquipmentServices(intraAuth);

  const [medicalEquipmentList, setMedicalEquipmentList] = useState<
    { id: number; name: string; quantity: number }[]
  >([]);

  useEffect(() => {
    const fetchMedicalEquipment = async () => {
      try {
        const res = await maService.getMedicalEquipmentQuery();
        setMedicalEquipmentList(res);
      } catch (error) {
        console.error(error);
        message.error("โหลดรายการเครื่องมือไม่สำเร็จ");
      }
    };
    fetchMedicalEquipment();
  }, []);

  const onFinish = async (values: any) => {
    try {
      // สร้าง payload ตามรูปแบบ backend ต้องการ
      const payload = {
        sentDate: values.sentDate.toISOString(),
        receivedDate: values.receivedDate
          ? values.receivedDate.toISOString()
          : null,
        note: values.note,
        // แปลง equipmentInfo ให้เป็น items [{ medicalEquipmentId, quantity }]
        items: values.equipmentInfo.map((item: any) => ({
          medicalEquipmentId: item.medicalEquipmentId,
          quantity: item.quantity,
        })),
      };

      // เรียก service ตามรูปแบบที่คุณให้มา
      const res = await maService.createMaMedicalEquipment(payload);

      // ถ้า backend ส่งกลับ data สำเร็จ
      if (res) {
        setLoading(true);
        message.success("บันทึกข้อมูลสำเร็จ");
        form.resetFields();
      } else {
        message.error("ไม่สามารถบันทึกข้อมูลได้");
      }
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
        initialValues={{ status: "Pending" }}
      >
        <Form.List name="equipmentInfo">
          {(fields, { add, remove }) => (
            <>
              <label>เลือกเครื่องมือ</label>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "medicalEquipmentId"]}
                    rules={[
                      { required: true, message: "กรุณาเลือกเครื่องมือ" },
                    ]}
                  >
                    <Select
                      placeholder="เลือกเครื่องมือ"
                      style={{ width: 200 }}
                      showSearch
                      optionFilterProp="children"
                      onChange={() => {
                        // รีเซ็ตจำนวนเมื่อเปลี่ยนเครื่องมือ
                        form.setFields([
                          {
                            name: ["equipmentInfo", name, "quantity"],
                            value: undefined,
                          },
                        ]);
                      }}
                    >
                      {medicalEquipmentList.map((eq) => (
                        <Option key={eq.id} value={eq.id}>
                          {eq.name} (คงเหลือ {eq.quantity})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "quantity"]}
                    rules={[
                      { required: true, message: "กรุณากรอกจำนวน" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const equipmentId = getFieldValue([
                            "equipmentInfo",
                            name,
                            "medicalEquipmentId",
                          ]);
                          if (!equipmentId) return Promise.resolve();
                          const selected = medicalEquipmentList.find(
                            (eq) => eq.id === equipmentId
                          );
                          if (value > (selected?.quantity || 0)) {
                            return Promise.reject(
                              new Error(
                                `จำนวนเกินคงเหลือ (${selected?.quantity})`
                              )
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <InputNumber min={1} placeholder="จำนวน" />
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
