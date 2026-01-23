"use client";

import React, { useEffect } from "react";
import {
  Button,
  Form,
  InputNumber,
  DatePicker,
  Select,
  message,
  Card,
  Row,
  Col,
  Input,
  FormListFieldData,
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import { MaMedicalEquipmentType, MedicalEquipmentType } from "../../common";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";
import th_TH from "antd/es/date-picker/locale/th_TH";
dayjs.extend(buddhistEra);
dayjs.locale("th");

import { SaveOutlined } from "@ant-design/icons"; /* ไอคอนสำหรับปุ่มบันททึกฟอร์ม */

const { TextArea } = Input;
const { Option } = Select;

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  dataEQ: MedicalEquipmentType[];
  data: MaMedicalEquipmentType[];
  fetchData: () => Promise<void>;
};

export default function CreateMedicalEquipmentForm({
  setLoading,
  dataEQ,
  data,
  fetchData,
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
        createdAt: new Date(),
        items: values.equipmentInfo.map((item: any) => ({
          medicalEquipmentId: item.medicalEquipmentId,
          quantity: item.quantity,
        })),
      };

      const res = await maService.createMaMedicalEquipment(payload);
      if (res) {
        setLoading(true);
        fetchData(); // แก้ไข Syntax เรียกใช้ function
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

  // --- Styles Constants ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  // สไตล์เฉพาะสำหรับ Select ของ Ant Design ให้มนและมีเงา
  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  return (
    <Card>
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
                <div className="mb-4 text-base font-semibold text-gray-700">
                  รายการเครื่องมือที่ส่งซ่อม
                </div>

                {groupedFields.map((pair, rowIndex) => (
                  <Row gutter={24} key={rowIndex} className="mb-2">
                    {pair.map(({ key, name, ...restField }) => (
                      <Col span={12} key={key}>
                        {/* กรอบของแต่ละ Item เพื่อให้ดูเป็นกลุ่มก้อน */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 relative hover:shadow-md transition-shadow">
                          <Row gutter={12} align="bottom">
                            {/* 1. เลือกเครื่องมือ */}
                            <Col flex="auto">
                              <Form.Item
                                {...restField}
                                label={
                                  <span className="text-gray-600">
                                    ชื่อเครื่องมือ
                                  </span>
                                }
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
                                  className={selectStyle}
                                >
                                  {dataEQ.map((eq) => {
                                    // --- Logic คำนวณ Stock คงเดิม ---
                                    const reservedQuantity = dataEQ
                                      .flatMap((ma) => ma.items || [])
                                      .filter(
                                        (item: any) =>
                                          item.medicalEquipmentId === eq.id &&
                                          ["pending", "approve"].includes(
                                            item.maMedicalEquipment?.status,
                                          ),
                                      )
                                      .reduce(
                                        (sum: number, item: any) =>
                                          sum + item.quantity,
                                        0,
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

                            {/* 2. จำนวน */}
                            <Col flex="100px">
                              <Form.Item
                                {...restField}
                                label={
                                  <span className="text-gray-600">จำนวน</span>
                                }
                                name={[name, "quantity"]}
                                style={{ marginBottom: 0 }}
                                rules={[
                                  { required: true, message: "ระบุจำนวน" },
                                  ({ getFieldValue }) => ({
                                    validator(_, value) {
                                      const equipmentId = getFieldValue([
                                        "equipmentInfo",
                                        name,
                                        "medicalEquipmentId",
                                      ]);
                                      if (!equipmentId)
                                        return Promise.resolve();

                                      const selected = dataEQ.find(
                                        (eq) => eq.id === equipmentId,
                                      );

                                      if (selected) {
                                        const reservedQuantity = dataEQ
                                          .flatMap((ma) => ma.items || [])
                                          .filter(
                                            (item: any) =>
                                              item.medicalEquipmentId ===
                                                selected.id &&
                                              ["pending", "approve"].includes(
                                                item.maMedicalEquipment?.status,
                                              ),
                                          )
                                          .reduce(
                                            (sum: number, item: any) =>
                                              sum + item.quantity,
                                            0,
                                          );

                                        const actualRemainingQuantity =
                                          selected.quantity - reservedQuantity;

                                        if (value > actualRemainingQuantity) {
                                          return Promise.reject(
                                            new Error(
                                              `เกินสต็อก (${actualRemainingQuantity})`,
                                            ),
                                          );
                                        }
                                      }
                                      return Promise.resolve();
                                    },
                                  }),
                                ]}
                              >
                                <InputNumber
                                  min={1}
                                  placeholder="0"
                                  className="w-full h-11 rounded-xl border-gray-300 shadow-sm pt-1" // pt-1 เพื่อจัด text ให้กลางเพราะ InputNumber มี padding แปลกๆ
                                />
                              </Form.Item>
                            </Col>

                            {/* 3. ปุ่มลบ */}
                            <Col>
                              <Button
                                danger
                                type="text"
                                onClick={() => remove(name)}
                                className="h-11 w-11 flex items-center justify-center rounded-xl hover:bg-red-50"
                              >
                                ลบ
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    ))}
                  </Row>
                ))}

                {/* ปุ่มเพิ่มรายการ */}
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

                      if (
                        !lastItem ||
                        !lastItem.medicalEquipmentId ||
                        !lastItem.quantity
                      ) {
                        message.warning(
                          "กรุณากรอกข้อมูลเครื่องมือและจำนวนให้ครบก่อน",
                        );
                        return;
                      }
                      add();
                    }}
                    className="h-11 rounded-xl border-blue-300 text-blue-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-400 shadow-sm transition-all"
                  >
                    + เพิ่มรายการเครื่องมือ
                  </Button>
                </Form.Item>
              </>
            );
          }}
        </Form.List>

        <div className="border-t border-gray-100 my-6 pt-6"></div>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="วันที่ส่งซ่อม"
              name="sentDate"
              rules={[{ required: true, message: "กรุณาเลือกวันที่ส่ง" }]}
            >
              <DatePicker
                locale={th_TH}
                format="D MMMM BBBB"
                placeholder="เลือกวันที่"
                className={`${inputStyle} w-full`} // ใช้ inputStyle ร่วมกับ w-full
                disabledDate={(current) => {
                  if (!current) return false;
                  const today = dayjs().startOf("day");
                  if (current < today) return true;
                  const bookedDates = data
                    .map((item: any) =>
                      item.sentDate
                        ? dayjs(item.sentDate).startOf("day")
                        : null,
                    )
                    .filter(Boolean);
                  return bookedDates.some((d: any) => d.isSame(current, "day"));
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="หมายเหตุ" name="note">
              <TextArea
                rows={1} // เริ่มต้น 1 บรรทัด แต่จะขยายถ้ามีข้อความ (หรือปรับเป็น 2 ก็ได้)
                placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                className="rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:shadow-md"
                style={{ minHeight: "44px" }} // ให้สูงเท่า Input ปกติ
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item className="text-center mt-4 mb-0">
          <Button
            icon={<SaveOutlined />}
            type="primary"
            htmlType="submit"
            className="h-9 px-6 rounded-lg text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            บันทึกข้อมูล
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
