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
  FormListFieldData,
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
        preserve={false}
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ status: "Pending" }}
      >
        <Form.List name="equipmentInfo">
          {(fields, { add, remove }) => {
            const groupedFields: FormListFieldData[][] = [];
            for (let i = 0; i < fields.length; i += 2) {
              groupedFields.push(fields.slice(i, i + 2));
            }

            return (
              <>
                <label>เลือกเครื่องมือ</label>

                {groupedFields.map((pair, rowIndex) => (
                  <Row gutter={16} key={rowIndex} style={{ marginBottom: 8 }}>
                    {pair.map(({ key, name, ...restField }) => (
                      <Col span={12} key={key}>
                        <Row gutter={8} align="middle">
                          {/* Select */}
                          <Col flex="auto">
                            <Form.Item
                              {...restField}
                              name={[name, "medicalEquipmentId"]}
                              rules={[
                                {
                                  required: true,
                                  message: "กรุณาเลือกเครื่องมือ",
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <Select
                                placeholder="เลือกเครื่องมือ"
                                showSearch
                                optionFilterProp="children"
                                style={{ width: "100%" }} // ✅ ใช้เต็มพื้นที่
                              >
                                {dataEQ.map((eq) => {
                                  const reservedQuantity = dataEQ
                                    .flatMap((ma) => ma.items || [])
                                    .filter(
                                      (item: any) =>
                                        item.medicalEquipmentId === eq.id &&
                                        ["pending", "approve"].includes(
                                          item.maMedicalEquipment?.status
                                        )
                                    )
                                    .reduce(
                                      (sum: number, item: any) =>
                                        sum + item.quantity,
                                      0
                                    );

                                  const remainingQuantity =
                                    eq.quantity - reservedQuantity;

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
                                      disabled={
                                        isSelected || remainingQuantity <= 0
                                      }
                                    >
                                      {eq.equipmentName} (คงเหลือ{" "}
                                      {remainingQuantity})
                                    </Option>
                                  );
                                })}
                              </Select>
                            </Form.Item>
                          </Col>

                          {/* Quantity */}
                          <Col flex="120px">
                            {" "}
                            {/* ✅ กำหนด fix ไว้เฉพาะช่องจำนวน */}
                            <Form.Item
                              {...restField}
                              name={[name, "quantity"]}
                              style={{ marginBottom: 0 }}
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
                              <InputNumber
                                min={1}
                                placeholder="จำนวน"
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                          </Col>

                          {/* Remove button */}
                          <Col>
                            <Button danger onClick={() => remove(name)}>
                              ลบ
                            </Button>
                          </Col>
                        </Row>
                      </Col>
                    ))}
                  </Row>
                ))}

                {/* ปุ่มเพิ่ม */}
                <Form.Item>
                  <Button
                    type="dashed"
                    block
                    onClick={() => {
                      const values = form.getFieldValue("equipmentInfo") || [];
                      const lastItem = values[values.length - 1];

                      if (values.length === 0) {
                        add();
                        return;
                      }

                      // ✅ ต้องกรอกให้ครบก่อนเพิ่มใหม่
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
            );
          }}
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
