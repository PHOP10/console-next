"use client";

import React, { useEffect, useState } from "react";
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
  MaCarType,
} from "../../common";
import { useSession } from "next-auth/react";
import th_TH from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
import isBetween from "dayjs/plugin/isBetween";

dayjs.locale("th");
dayjs.extend(isBetween);

import { useRouter } from "next/navigation";
import { buddhistLocale } from "@/app/common";

interface Props {
  dataUser: UserType[];
  cars: MasterCarType[];
  oTRUser: OfficialTravelRequestType[];
  dataOTR: OfficialTravelRequestType[];
  maCars?: MaCarType[];
}

export default function OfficialTravelRequestBookForm({
  dataUser,
  cars,
  oTRUser,
  dataOTR,
  maCars,
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

      const currentStart = dayjs(startDate);
      const currentEnd = dayjs(endDate);

      const isCarOverlaps =
        dataOTR &&
        dataOTR.some((booking) => {
          if (booking.status === "cancel") return false;
          if (travelType !== "official") return false;

          if (!carId || Number(booking.carId) !== Number(carId)) {
            return false;
          }
          const bStart = dayjs(booking.startDate);
          const bEnd = dayjs(booking.endDate);
          const isTimeOverlap =
            currentStart.isBefore(bEnd) && currentEnd.isAfter(bStart);

          return isTimeOverlap;
        });

      if (isCarOverlaps) {
        message.warning("มีการจองรถที่คุณเลือกในช่วงเวลานี้แล้ว");
        setSubmitting(false);
        return;
      }

      // ---------------------------------------------------------
      const isMaCarOverlaps =
        maCars &&
        maCars.some((booking) => {
          // ข้ามถ้ายกเลิก
          if (booking.status === "cancel") return false;

          if (travelType !== "official") return false;

          if (!carId || Number(booking.carId) !== Number(carId)) {
            return false;
          }

          const bStart = dayjs(booking.dateStart);
          const bEnd = dayjs(booking.dateEnd);
          return currentStart.isBefore(bEnd) && currentEnd.isAfter(bStart);
        });

      if (isMaCarOverlaps) {
        message.warning("รถคันนี้ไม่ว่างในช่วงเวลานี้ (ชนกับการจองรถ)");
        setSubmitting(false);
        return;
      }
      // ---------------------------------------------------------

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
      router.push("/page/official-travel-request/officialTravelRequest?tab=2");
    } catch (err) {
      console.error(err);
      message.error("บันทึกคำขอไม่สำเร็จ");
      setSubmitting(false);
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

  useEffect(() => {
    // 1. Set default state: Always include the current user
    if (session?.user?.userId) {
      const currentNames = form.getFieldValue("passengerNames") || [];

      // If current user is not in the list, add them
      if (!currentNames.includes(session.user.userId)) {
        const newNames = [...currentNames, session.user.userId];
        form.setFieldsValue({
          passengerNames: newNames,
          passengers: newNames.length, // ✅ Auto-update the count immediately
        });
      }
    }
  }, [session, form]);

  // --- Styles ---
  const inputStyle =
    "w-full h-10 sm:h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-sm";

  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-sm";

  const selectStyle =
    "h-10 sm:h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400 text-sm";

  const optionGroupStyle =
    "bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200";

  return (
    <Card bordered={false} className="shadow-sm">
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Section 1: ข้อมูลเอกสาร */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
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
            <Col xs={24} sm={12}>
              <Form.Item
                label="เรียน"
                name="recipient"
                rules={[{ required: true, message: "กรุณากรอกเรียน..." }]}
              >
                <Select
                  placeholder="ระบุเรียน"
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
                          className="rounded-lg h-9 text-sm"
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

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="วัตถุประสงค์"
                name="missionDetail"
                rules={[{ required: true, message: "กรุณากรอกวัตถุประสงค์" }]}
              >
                <Input.TextArea
                  rows={2}
                  className={textAreaStyle}
                  placeholder="กรอกวัตถุประสงค์"
                  maxLength={200}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="สถานที่"
                name="location"
                rules={[{ required: true, message: "กรุณากรอกสถานที่" }]}
              >
                <Input.TextArea
                  rows={2}
                  className={textAreaStyle}
                  placeholder="กรอกสถานที่"
                  maxLength={200}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Section 2: วันเวลาเดินทาง (แก้ไข Logic Validator) */}
          <div className="bg-blue-50/30 p-3 sm:p-4 rounded-xl border border-blue-100 mb-6 mt-2">
            <Row gutter={16}>
              {/* --- 1. วันที่เริ่มต้น (Start Date) --- */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="ตั้งแต่วันที่-เวลา"
                  name="startDate"
                  dependencies={["carId", "travelType"]} // รีรัน validator เมื่อ 2 ค่านี้เปลี่ยน
                  rules={[
                    {
                      required: true,
                      message: "กรุณาเลือกวันที่เริ่มเดินทาง",
                    },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();

                        // ดึงค่าสดๆ จาก Form เพื่อความชัวร์
                        const currentTravelType =
                          form.getFieldValue("travelType");
                        const currentCarId = form.getFieldValue("carId");

                        // 1. เช็ค User Overlap (คนเดิมห้ามจองซ้อน)
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

                        // Logic: เช็คว่ารถว่างไหม (เฉพาะรถราชการ)
                        if (currentTravelType === "official" && currentCarId) {
                          // ✅ ป้องกัน dataOTR เป็น undefined ด้วย || []
                          const isCarBusy = (dataOTR || []).some((booking) => {
                            if (booking.status === "cancel") return false;

                            // ข้ามถ้ารถคนละคัน
                            if (Number(booking.carId) !== Number(currentCarId))
                              return false;

                            const bStart = dayjs(booking.startDate);
                            const bEnd = dayjs(booking.endDate);

                            // เช็คว่าจุดเริ่มต้นของเรา ไปแทรกอยู่ในช่วงเวลาของคนอื่นไหม
                            return value.isBetween(bStart, bEnd, null, "[]");
                          });

                          if (isCarBusy) {
                            return Promise.reject(
                              new Error("รถไม่ว่างในช่วงเวลานี้"),
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
                    locale={buddhistLocale}
                    showTime={{ format: "HH:mm" }}
                    style={{ width: "100%" }}
                    format={formatBuddhist}
                    className={`${inputStyle} pt-1`}
                    placeholder="เลือกวันและเวลาเริ่ม"
                    onChange={() => form.setFieldValue("endDate", null)} // เคลียร์วันจบเมื่อเปลี่ยนวันเริ่ม
                    disabledDate={(current) => {
                      // ห้ามเลือกวันย้อนหลัง (แต่วันปัจจุบันเลือกได้ เพื่อระบุเวลา)
                      return current && current < dayjs().startOf("day");
                    }}
                  />
                </Form.Item>
              </Col>

              {/* --- 2. วันที่สิ้นสุด (End Date) --- */}
              <Col xs={24} sm={12}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, cur) =>
                    prev.startDate !== cur.startDate ||
                    prev.carId !== cur.carId ||
                    prev.travelType !== cur.travelType
                  }
                >
                  {({ getFieldValue }) => {
                    const dateStart = getFieldValue("startDate");
                    return (
                      <Form.Item
                        label="ถึงวันที่-เวลา"
                        name="endDate"
                        dependencies={["startDate", "carId", "travelType"]}
                        rules={[
                          {
                            required: true,
                            message: "กรุณาเลือกวันที่สิ้นสุดเดินทาง",
                          },
                          {
                            validator: (_, value) => {
                              if (!value || !dateStart)
                                return Promise.resolve();

                              const currentStart = dayjs(dateStart);
                              const currentEnd = dayjs(value);

                              // 1. เช็ค Logic พื้นฐาน: เวลาจบ ต้องหลัง เวลาเริ่ม
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

                              // 2. เช็ครถว่าง (Overlap Check)
                              const travelType = getFieldValue("travelType");
                              const carId = getFieldValue("carId");

                              if (travelType === "official" && carId) {
                                // ✅ ป้องกัน dataOTR เป็น undefined
                                const isCarOverlap = (dataOTR || []).some(
                                  (booking) => {
                                    if (booking.status === "cancel")
                                      return false;

                                    if (Number(booking.carId) !== Number(carId))
                                      return false;

                                    const bStart = dayjs(booking.startDate);
                                    const bEnd = dayjs(booking.endDate);

                                    // สูตร Overlap: (StartA < EndB) && (EndA > StartB)
                                    return (
                                      currentStart.isBefore(bEnd) &&
                                      currentEnd.isAfter(bStart)
                                    );
                                  },
                                );

                                if (isCarOverlap) {
                                  return Promise.reject(
                                    new Error("รถถูกจองแล้วในช่วงเวลานี้"),
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
                          locale={buddhistLocale}
                          showTime={{ format: "HH:mm" }}
                          style={{ width: "100%" }}
                          format={formatBuddhist}
                          className={`${inputStyle} pt-1`}
                          placeholder={
                            dateStart ? `เลือกเวลาสิ้นสุด` : "เลือกวันเริ่มก่อน"
                          }
                          disabled={!dateStart}
                          disabledDate={(current) => {
                            // ห้ามเลือกวันก่อนวันเริ่ม
                            if (
                              dateStart &&
                              current < dayjs(dateStart).startOf("day")
                            ) {
                              return true;
                            }
                            // ห้ามเลือกวันย้อนหลัง
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
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="travelType"
                    noStyle
                    rules={[{ required: true }]}
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

                {/* Dynamic Inputs */}
                <Col xs={24} sm={12}>
                  <div className="flex items-center h-full pl-0 sm:pl-6 border-l-0 sm:border-l border-gray-200 mt-4 sm:mt-0 min-h-[150px]">
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
                            optionFilterProp="children"
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
                          rules={[{ required: true }]}
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
          {/* Section 4: Passengers (Auto-Calculation Logic) */}
          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Form.Item
                label="จำนวนผู้โดยสาร"
                name="passengers"
                // No rules needed, as it is controlled by the system
              >
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-1 bg-gray-50 text-gray-500`} // Add gray background to indicate read-only
                  readOnly // ✅ Lock this field. User cannot type manually.
                  controls={false} // Hide +/- buttons
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={18}>
              <Form.Item
                label="รายชื่อผู้โดยสาร"
                name="passengerNames"
                rules={[{ required: true, message: "กรุณาเลือกผู้โดยสาร" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="เลือกผู้โดยสาร"
                  optionFilterProp="children"
                  className={selectStyle}
                  maxTagCount="responsive"
                  // ✅ 1. When names change, automatically update the number
                  onChange={(values) => {
                    form.setFieldValue("passengers", values.length);
                  }}
                  // ✅ 2. Prevent removing self (Better UX than showing an error)
                  onDeselect={(val) => {
                    if (val === session?.user?.userId) {
                      // If user tries to remove themselves, re-add them instantly
                      const current = form.getFieldValue("passengerNames");
                      // Use setTimeout to ensure state updates correctly after the deselect event
                      setTimeout(() => {
                        const restored = [...current, val];

                        // 🛠️ แก้ตรงนี้: ใช้ Array.from แทน [...new Set] เพื่อแก้ Error TypeScript
                        const unique = Array.from(new Set(restored));

                        form.setFieldValue("passengerNames", unique);
                        form.setFieldValue("passengers", unique.length);
                        message.warning("ผู้ยื่นคำขอต้องร่วมเดินทางด้วยเสมอ");
                      }, 0);
                    }
                  }}
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

          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Form.Item
                label="งบประมาณ"
                name="budget"
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
            <Col xs={24} sm={18}>
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
                className="h-10 px-8 rounded-lg text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-[#0683e9] flex items-center w-full sm:w-auto justify-center"
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
