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
  Row,
  Col,
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import dayjs from "dayjs";
import { MaMedicalEquipmentType, MedicalEquipmentType } from "../../common";
import { useSession } from "next-auth/react";

const { TextArea } = Input;
const { Option } = Select;

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  dataEQ: MedicalEquipmentType[];
  data: MaMedicalEquipmentType[];
};

export default function CreateMedicalEquipmentForm({
  setLoading,
  dataEQ,
  data,
}: Props) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const { data: session } = useSession();

  const maService = maMedicalEquipmentServices(intraAuth);

  const onFinish = async (values: any) => {
    try {
      const payload = {
        sentDate: values.sentDate.toISOString(),
        receivedDate: values.receivedDate
          ? values.receivedDate.toISOString()
          : null,
        note: values.note,
        createdBy: session?.user?.fullName,
        createdById: session?.user?.userId,
        items: values.equipmentInfo.map((item: any) => ({
          medicalEquipmentId: item.medicalEquipmentId,
          quantity: item.quantity,
        })),
      };

      const res = await maService.createMaMedicalEquipment(payload);
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

  useEffect(() => {
    form.resetFields();
  }, [form]);

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
                    >
                      {dataEQ.map((eq) => {
                        // const dataEQe =
                        //   eq.items?.map((item: any) => item.quantity) || [];
                        // console.log(dataEQe);

                        const reservedQuantity = dataEQ
                          .flatMap((ma) => ma.items || [])
                          .filter(
                            (item: any) =>
                              item.medicalEquipmentId === eq.id &&
                              item.medicalEquipmentId === eq.id &&
                              ["pending", "approve"].includes(
                                item.maMedicalEquipment?.status
                              )
                          )
                          .reduce(
                            (sum: number, item: any) => sum + item.quantity,
                            0
                          );

                        const remainingQuantity =
                          eq.quantity - reservedQuantity;

                        // 3️⃣ ป้องกันเลือกซ้ำในฟอร์ม
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

                        // 4️⃣ แสดงใน Select Option
                        return (
                          <Option
                            key={eq.id}
                            value={eq.id}
                            disabled={isSelected || remainingQuantity <= 0} // ปิดถ้าเลือกซ้ำ หรือหมด
                          >
                            {eq.equipmentName} (คงเหลือ {remainingQuantity})
                          </Option>
                        );
                      })}
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
                          const selected = dataEQ.find(
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

              {/* <Form.Item>
                <Button type="dashed" onClick={() => add()} block>
                  + เพิ่มรายการเครื่องมือ
                </Button>
              </Form.Item> */}
              <Form.Item>
                <Button
                  type="dashed"
                  block
                  onClick={() => {
                    const values = form.getFieldValue("equipmentInfo") || [];
                    const lastItem = values[values.length - 1];

                    if (values.length === 0) {
                      // ✅ ยังไม่มีเลย → เพิ่มอันแรกได้เลย
                      add();
                      return;
                    }

                    // ✅ ถ้ามีแล้ว → ต้องเช็กว่าอันล่าสุดกรอกครบ
                    if (
                      !lastItem ||
                      !lastItem.medicalEquipmentId ||
                      !lastItem.quantity
                    ) {
                      message.warning(
                        "กรุณากรอกข้อมูลเครื่องมือและจำนวนให้ครบก่อน"
                      );
                      return;
                    }

                    add();
                  }}
                >
                  + เพิ่มรายการเครื่องมือ
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Row gutter={18}>
          <Col span={12}>
            <Form.Item
              label="วันที่ส่ง"
              name="sentDate"
              rules={[{ required: true, message: "กรุณาเลือกวันที่ส่ง" }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="หมายเหตุ" name="note">
              <TextArea rows={3} placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item style={{ textAlign: "center" }}>
          <Button type="primary" htmlType="submit">
            บันทึกข้อมูล
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
