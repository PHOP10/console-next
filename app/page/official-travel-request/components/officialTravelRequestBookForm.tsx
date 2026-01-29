"use client";

import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  message,
  Spin,
  Card,
  InputNumber,
  Row,
  Col,
  ConfigProvider,
  Radio,
  Space,
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";
import {
  UserType,
  MasterCarType,
  OfficialTravelRequestType,
} from "../../common";
import { useSession } from "next-auth/react";
import th_TH from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
import isBetween from "dayjs/plugin/isBetween";

dayjs.locale("th");
dayjs.extend(isBetween);

import { useRouter } from "next/navigation";

interface Props {
  dataUser: UserType[];
  cars: MasterCarType[];
  oTRUser: OfficialTravelRequestType[];
  dataOTR: OfficialTravelRequestType[];
}

export default function OfficialTravelRequestBookForm({
  dataUser,
  cars,
  oTRUser,
  dataOTR,
}: Props) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const service = officialTravelRequestService(intraAuth);
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const selectedTravelType = Form.useWatch("travelType", form);
  const router = useRouter();

  // --- ส่วนที่แก้ไข Logic ---
  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const { carId, startDate, endDate, travelType } = values;

      // แปลงวันที่ที่เลือกมาเป็น dayjs object เพื่อเทียบเวลา (ไม่ต้องใช้ startOf day)
      const currentStart = dayjs(startDate);
      const currentEnd = dayjs(endDate);

      const isCarOverlaps =
        dataOTR &&
        dataOTR.some((booking) => {
          if (booking.status === "cancel") return false;

          // ถ้าไม่ใช่รถราชการ ไม่ต้องเช็คการชนของรถ
          if (travelType !== "official") return false;

          // เช็คว่าเป็นรถคันเดียวกันหรือไม่
          // (ต้องเช็ค carId ก่อน ถ้าคนละคัน เวลาชนกันก็ได้ ไม่เป็นไร)
          if (!carId || Number(booking.carId) !== Number(carId)) {
            return false;
          }

          // แปลงเวลาของ Booking ที่มีอยู่
          const bStart = dayjs(booking.startDate);
          const bEnd = dayjs(booking.endDate);

          // สูตรเช็ค Time Overlap มาตรฐาน: (StartA < EndB) && (EndA > StartB)
          // ❌ ของเดิม: ใช้ .startOf('day') ทำให้มันเหมาทั้งวัน
          // ✅ ของใหม่: เทียบเวลาจริง (HH:mm)
          const isTimeOverlap =
            currentStart.isBefore(bEnd) && currentEnd.isAfter(bStart);

          return isTimeOverlap;
        });

      if (isCarOverlaps) {
        message.warning("มีการจองรถที่คุณเลือกในช่วงเวลานี้แล้ว");
        setSubmitting(false); // ✅ แก้ไข: ต้องหยุด Loading เมื่อเจอปัญหา
        return;
      }

      const payload = {
        ...values,
        recipient: values.recipient || null,
        documentNo: values.documentNo,
        missionDetail: values.missionDetail,
        location: values.location,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        endDate: values.endDate ? values.endDate.toISOString() : null,
        passengers: values.passengers || null,
        passengerNames: values.passengerNames || [],
        carId: values.carId || null,
        cancelReason: values.cancelReason || null,
        status: "pending",
        createdName: session?.user?.fullName,
        createdById: session?.user?.userId,
        travelType: values.travelType ? [values.travelType] : [],
      };

      await service.createOfficialTravelRequest(payload);
      message.success("บันทึกคำขอเรียบร้อยแล้ว");
      form.resetFields();
      router.push("/page/official-travel-request/officialTravelRequest");
    } catch (err) {
      console.error(err);
      message.error("บันทึกคำขอไม่สำเร็จ");
      setSubmitting(false); // หยุด Loading เมื่อเกิด Error
    }
  };

  if (loading) return <Spin />;

  const formatBuddhist = (date: dayjs.Dayjs | null) => {
    if (!date) return "";
    const d = dayjs(date).locale("th");
    return `${d.date()} ${d.format("MMMM")} ${d.year() + 543} เวลา ${d.format(
      "HH:mm",
    )} น.`;
  };

  // --- Styles ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  const optionGroupStyle = "bg-gray-50 p-4 rounded-xl border border-gray-200";

  return (
    <Card>
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Section 1: ข้อมูลเอกสาร */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="เลขที่เอกสาร"
                name="documentNo"
                normalize={(value) =>
                  value.replace(/[^ก-ฮ0-9./\s]/g, "").replace(/\s+/g, " ")
                }
                rules={[
                  { required: true, message: "กรุณากรอกเลขที่เอกสาร" },
                  {
                    pattern: /^[ก-ฮ0-9./\s]+$/,
                    message:
                      "กรอกได้เฉพาะตัวอักษรไทย ตัวเลข จุด (.) และทับ (/) เท่านั้น",
                  },
                  {
                    validator: (_, value) => {
                      if (
                        value &&
                        dataOTR.some((doc) => doc.documentNo === value)
                      ) {
                        return Promise.reject(
                          new Error("เลขที่เอกสารนี้ซ้ำกับในระบบ"),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  placeholder="เช่น ตก 0000.1.1/111"
                  maxLength={15}
                  className={inputStyle}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="เรียน"
                name="recipient"
                rules={[{ required: true, message: "กรุณากรอกเรียน..." }]}
              >
                <Select
                  placeholder="กรอกเรียน"
                  className={selectStyle}
                  onChange={(value) => {
                    form.setFieldValue(
                      "recipient",
                      value === "other" ? "" : value,
                    );
                  }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ display: "flex", padding: 8 }}>
                        <Input
                          placeholder="กรอกอื่น ๆ ..."
                          className="rounded-lg"
                          onPressEnter={(e) => {
                            form.setFieldValue(
                              "recipient",
                              e.currentTarget.value,
                            );
                          }}
                          onBlur={(e) => {
                            form.setFieldValue(
                              "recipient",
                              e.currentTarget.value,
                            );
                          }}
                        />
                      </div>
                    </>
                  )}
                >
                  <Select.Option value="สาธารณสุขอำเภอวังเจ้า">
                    สาธารณสุขอำเภอวังเจ้า
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="วัตถุประสงค์"
                name="missionDetail"
                rules={[{ required: true, message: "กรุณากรอกวัตถุประสงค์" }]}
              >
                <Input.TextArea
                  placeholder="กรอกวัตถุประสงค์"
                  rows={2}
                  className={textAreaStyle}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="สถานที่"
                name="location"
                rules={[{ required: true, message: "กรุณากรอกสถานที่" }]}
              >
                <Input.TextArea
                  placeholder="กรอกสถานที่"
                  rows={2}
                  className={textAreaStyle}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Section 2: วันเวลาเดินทาง */}
          {/* Section 2: วันเวลาเดินทาง */}
          <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 mb-6 mt-2">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="ตั้งแต่วันที่-เวลา"
                  name="startDate"
                  dependencies={["carId", "travelType"]} // ✅ เพิ่ม: ให้เช็คใหม่เมื่อเปลี่ยนรถ
                  rules={[
                    {
                      required: true,
                      message: "กรุณาเลือกวันและเวลาที่เริ่มเดินทาง",
                    },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();

                        // 1. เช็คว่า "เรา" ติดธุระอื่นไหม (oTRUser)
                        const isUserBusy = oTRUser.some((booking) => {
                          if (booking.status === "cancel") return false;
                          const bStart = dayjs(booking.startDate);
                          const bEnd = dayjs(booking.endDate);
                          return value.isBetween(bStart, bEnd, null, "[]");
                        });
                        if (isUserBusy) {
                          return Promise.reject(
                            new Error("คุณมีรายการจองอื่นในช่วงเวลานี้"),
                          );
                        }

                        // 2. ✅ เพิ่ม: เช็คว่า "รถ" ว่างไหม (dataOTR)
                        const travelType = form.getFieldValue("travelType");
                        const carId = form.getFieldValue("carId");

                        if (travelType === "official" && carId) {
                          const isCarBusy = dataOTR.some((booking) => {
                            if (booking.status === "cancel") return false;
                            // เช็คเฉพาะรถคันที่เราเลือก
                            if (Number(booking.carId) !== Number(carId))
                              return false;

                            const bStart = dayjs(booking.startDate);
                            const bEnd = dayjs(booking.endDate);
                            // เช็คว่าเวลาที่เลือก ไปตกอยู่ในช่วงที่รถไม่ว่างไหม
                            return value.isBetween(bStart, bEnd, null, "[]");
                          });

                          if (isCarBusy) {
                            return Promise.reject(
                              new Error("รถคันนี้ไม่ว่างในช่วงเวลานี้"),
                            );
                          }
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    showTime={{ format: "HH:mm" }}
                    style={{ width: "100%" }}
                    placeholder="เลือกวันและเวลาเริ่ม"
                    format={formatBuddhist}
                    className={`${inputStyle} pt-1`}
                    onChange={() => form.setFieldValue("endDate", null)}
                    disabledDate={(current) => {
                      return current && current < dayjs().startOf("day");
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, cur) =>
                    prev.startDate !== cur.startDate ||
                    prev.carId !== cur.carId || // ✅ อัปเดตเมื่อเปลี่ยนรถ
                    prev.travelType !== cur.travelType
                  }
                >
                  {({ getFieldValue }) => {
                    const dateStart = getFieldValue("startDate");
                    return (
                      <Form.Item
                        name="endDate"
                        label="ถึงวันที่-เวลา"
                        dependencies={["startDate", "carId", "travelType"]} // ✅ เพิ่ม Dependencies
                        rules={[
                          {
                            required: true,
                            message: "กรุณาเลือกวันและเวลาที่สิ้นสุด",
                          },
                          {
                            validator: (_, value) => {
                              if (!value || !dateStart)
                                return Promise.resolve();

                              const currentStart = dayjs(dateStart);
                              const currentEnd = dayjs(value);

                              // เช็ค Logic เวลา
                              if (
                                currentEnd.isBefore(currentStart) ||
                                currentEnd.isSame(currentStart)
                              ) {
                                return Promise.reject(
                                  new Error(
                                    "เวลาสิ้นสุดต้องอยู่หลังจากเวลาเริ่มต้น",
                                  ),
                                );
                              }

                              // 1. เช็ค User Overlap (คนเดิมห้ามจองซ้อน)
                              const isUserOverlap = oTRUser.some((booking) => {
                                if (booking.status === "cancel") return false;
                                const bStart = dayjs(booking.startDate);
                                const bEnd = dayjs(booking.endDate);
                                return (
                                  currentStart.isBefore(bEnd) &&
                                  currentEnd.isAfter(bStart)
                                );
                              });
                              if (isUserOverlap) {
                                return Promise.reject(
                                  new Error(
                                    "คุณมีรายการจองอื่นซ้อนทับช่วงเวลานี้",
                                  ),
                                );
                              }

                              // 2. ✅ เพิ่ม: เช็ค Car Overlap (รถห้ามจองซ้อน)
                              const travelType = getFieldValue("travelType");
                              const carId = getFieldValue("carId");

                              if (travelType === "official" && carId) {
                                const isCarOverlap = dataOTR.some((booking) => {
                                  if (booking.status === "cancel") return false;
                                  if (Number(booking.carId) !== Number(carId))
                                    return false;

                                  const bStart = dayjs(booking.startDate);
                                  const bEnd = dayjs(booking.endDate);

                                  // สูตรเช็คชนกัน: (StartA < EndB) และ (EndA > StartB)
                                  return (
                                    currentStart.isBefore(bEnd) &&
                                    currentEnd.isAfter(bStart)
                                  );
                                });

                                if (isCarOverlap) {
                                  return Promise.reject(
                                    new Error(
                                      "รถคันนี้ถูกจองแล้วในช่วงเวลานี้",
                                    ),
                                  );
                                }
                              }

                              return Promise.resolve();
                            },
                          },
                        ]}
                        style={{ marginBottom: 0 }}
                      >
                        <DatePicker
                          showTime={{ format: "HH:mm" }}
                          style={{ width: "100%" }}
                          placeholder={
                            dateStart ? `เลือกเวลาสิ้นสุด` : "เลือกวันเริ่มก่อน"
                          }
                          format={formatBuddhist}
                          className={`${inputStyle} pt-1`}
                          disabled={!dateStart}
                          disabledDate={(current) => {
                            if (
                              dateStart &&
                              current < dayjs(dateStart).startOf("day")
                            ) {
                              return true;
                            }
                            return current && current < dayjs().startOf("day");
                          }}
                        />
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Section 3: ลักษณะการเดินทาง */}
          <div className="mb-6">
            <div className="mb-2 font-bold text-gray-700">
              <span className="text-red-500 mr-1">*</span> ลักษณะการเดินทาง
            </div>
            <div className={optionGroupStyle}>
              <Row gutter={24} align="top">
                <Col span={12}>
                  <Form.Item
                    name="travelType"
                    noStyle
                    rules={[{ required: true, message: "กรุณาเลือกประเภท" }]}
                  >
                    <Radio.Group style={{ width: "100%" }}>
                      <Space direction="vertical" size={12}>
                        <Radio value="official">1. โดยรถยนต์ราชการ</Radio>
                        <Radio value="bus">
                          2. รถยนต์โดยสารปรับอากาศประจำทาง
                        </Radio>
                        <Radio value="plane">3. เครื่องบินโดยสาร</Radio>
                        <Radio value="private">4. รถยนต์ส่วนบุคคล</Radio>
                        <Radio value="other">5. อื่น ๆ</Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                {/* Dynamic Inputs based on Selection */}
                <Col span={12}>
                  <div className="flex items-center h-full pl-6 border-l border-gray-200 min-h-[150px]">
                    <div className="w-full">
                      {selectedTravelType === "official" && (
                        <Form.Item
                          label="เลือกรถราชการ"
                          name="carId"
                          rules={[{ required: true, message: "กรุณาเลือกรถ" }]}
                        >
                          <Select
                            placeholder="เลือกรายชื่อรถในระบบ"
                            showSearch
                            className={selectStyle}
                          >
                            {cars.map((car) => (
                              <Select.Option key={car.id} value={car.id}>
                                {car.licensePlate} ({car.brand})
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      )}

                      {selectedTravelType === "private" && (
                        <Form.Item
                          label="ทะเบียนรถ"
                          name="privateCarId"
                          rules={[
                            {
                              required: true,
                              message: "กรุณากรอกทะเบียน",
                            },
                          ]}
                        >
                          <Input
                            placeholder="เช่น กข 1234 ตาก"
                            className={inputStyle}
                          />
                        </Form.Item>
                      )}

                      {selectedTravelType === "other" && (
                        <Form.Item
                          label="ระบุรายละเอียด"
                          name="otherTravelType"
                          rules={[{ required: true, message: "กรุณาระบุ" }]}
                        >
                          <Input
                            placeholder="เช่น รถไฟ, เรือ"
                            className={inputStyle}
                          />
                        </Form.Item>
                      )}

                      {(selectedTravelType === "bus" ||
                        selectedTravelType === "plane") && (
                        <div className="text-gray-400 text-center italic">
                          ไม่ต้องกรอกข้อมูลเพิ่มเติม
                        </div>
                      )}

                      {!selectedTravelType && (
                        <div className="text-gray-400 text-center">
                          กรุณาเลือกประเภทการเดินทางด้านซ้าย
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          {/* Section 4: ผู้โดยสารและงบประมาณ */}
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item
                label="จำนวนผู้โดยสาร"
                name="passengers"
                rules={[{ required: true, message: "ระบุจำนวน" }]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  maxLength={1}
                  precision={0}
                  style={{ width: "100%" }}
                  placeholder="0-9"
                  className={`${inputStyle} pt-1`}
                  parser={(value) => {
                    const parsed = value?.replace(/\D/g, "").slice(0, 1);
                    return parsed ? parseInt(parsed, 10) : "";
                  }}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) e.preventDefault();
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item label="รายชื่อผู้โดยสาร" name="passengerNames">
                <Select
                  mode="multiple"
                  placeholder="เลือกผู้โดยสาร"
                  optionFilterProp="children"
                  className={selectStyle}
                  maxTagCount="responsive"
                >
                  {dataUser.map((user) => (
                    <Select.Option key={user.userId} value={user.userId}>
                      {user.firstName} {user.lastName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={6}>
              <Form.Item
                name="budget"
                label="งบประมาณ"
                rules={[{ required: true, message: "เลือกงบประมาณ" }]}
              >
                <Select
                  placeholder="เลือกงบประมาณ"
                  allowClear
                  className={selectStyle}
                >
                  <Select.Option value="งบกลาง">งบกลาง</Select.Option>
                  <Select.Option value="งบโครงการ">งบโครงการ</Select.Option>
                  <Select.Option value="งบผู้จัด">งบผู้จัด</Select.Option>
                  <Select.Option value="เงินบำรุง">เงินบำรุง</Select.Option>
                  <Select.Option value="ไม่ขอเบิก">ไม่ขอเบิก</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item label="หมายเหตุเพิ่มเติม" name="note">
                <Input.TextArea
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                  rows={2}
                  className={textAreaStyle}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 16 }}>
            <div className="flex justify-center items-center gap-3">
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                className="h-10 px-8 rounded-lg text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-[#0683e9] flex items-center"
              >
                ยื่นคำขอ
              </Button>
            </div>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </Card>
  );
}
