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
  Checkbox,
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
dayjs.locale("th");
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

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
  // console.log("dataOTR:", dataOTR);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const { carId, startDate, endDate, travelType } = values;

      // เปลี่ยนชื่อจาก maCar หรือ dataOTR ให้ตรงกับตัวแปรที่คุณใช้จริง
      const isCarOverlaps =
        dataOTR &&
        dataOTR.some((booking) => {
          if (booking.status === "cancel") return false;

          // 1. ปรับเวลาของรายการใหม่ให้ครอบคลุมทั้งวัน
          const start = dayjs(startDate).startOf("day");
          const end = dayjs(endDate).endOf("day");

          // 2. ปรับเวลาของรายการในฐานข้อมูล (ใช้ชื่อฟิลด์ startDate, endDate ตาม Prisma Model)
          const bStart = dayjs(booking.startDate).startOf("day");
          const bEnd = dayjs(booking.endDate).endOf("day");

          // 3. Logic ตรวจสอบการทับซ้อน (Overlap)
          // สูตร: (รายการใหม่เริ่มก่อนรายการเก่าจบ) และ (รายการใหม่จบหลังรายการเก่าเริ่ม)
          const isTimeOverlap = start.isBefore(bEnd) && end.isAfter(bStart);

          // 4. เงื่อนไขรถคันเดียวกัน
          const isSameCarOverlap =
            travelType === "official" &&
            carId &&
            Number(booking.carId) === Number(carId);

          return isTimeOverlap && isSameCarOverlap;
        });

      if (isCarOverlaps) {
        message.warning(
          "ไม่สามารถดำเนินรายการได้: รถหมายเลขทะเบียนนี้มีการจองไว้แล้วในวันที่เลือก"
        );
        return;
      }

      // if (conflictBooking) {
      //   message.warning(
      //     `ไม่สามารถดำเนินรายการได้: รถหมายเลขทะเบียนนี้ถูกจองแล้วในช่วงเวลาดังกล่าว`
      //   );
      //   return; // หยุดการทำงานทันที
      // }

      const payload = {
        ...values,
        recipient: values.recipient || null,
        documentNo: values.documentNo,
        // title: values.title,
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
    } catch (err) {
      console.error(err);
      message.error("บันทึกคำขอไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spin />;

  const formatBuddhist = (value: dayjs.Dayjs | null) => {
    if (!value) return "";
    const date = dayjs(value).locale("th");
    const day = date.date();
    const month = date.format("MMMM");
    const year = date.year() + 543;
    return `${day} ${month} ${year}`;
  };

  return (
    <Card
      title={
        <div
          style={{
            textAlign: "center",
            color: "#0683e9",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          ฟอร์มขอไปราชการ
        </div>
      }
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="เลขที่เอกสาร"
                name="documentNo"
                // ช่วยลบอักขระที่ไม่ต้องการออกทันทีขณะพิมพ์ (คงเหลือแค่ตัวเลข . และ /)
                normalize={(value) => value.replace(/[^0-9./]/g, "")}
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกเลขที่เอกสาร",
                  },
                  {
                    // ปรับ Pattern ให้รับเฉพาะ ตัวเลข, จุด และ ทับ เท่านั้น
                    pattern: /^[0-9./]+$/,
                    message: "กรอกได้เฉพาะตัวเลข จุด (.) และทับ (/) เท่านั้น",
                  },
                  {
                    validator: (_, value) => {
                      // ตรวจสอบความซ้ำซ้อนจาก dataOTR
                      if (
                        value &&
                        dataOTR.some((doc) => doc.documentNo === value)
                      ) {
                        return Promise.reject(
                          new Error("เลขที่เอกสารนี้ซ้ำกับในระบบ")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="เช่น 0999.9.9/99" maxLength={12} />
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
                  onChange={(value) => {
                    form.setFieldValue(
                      "recipient",
                      value === "other" ? "" : value
                    );
                  }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ display: "flex", padding: 8 }}>
                        <Input
                          placeholder="กรอกอื่น ๆ ..."
                          onPressEnter={(e) => {
                            form.setFieldValue(
                              "recipient",
                              e.currentTarget.value
                            );
                          }}
                          onBlur={(e) => {
                            form.setFieldValue(
                              "recipient",
                              e.currentTarget.value
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
                  {/* <Select.Option value="other">อื่นๆ...</Select.Option> */}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="วัตถุประสงค์"
                name="missionDetail"
                rules={[{ required: true, message: "กรุณากรอกวัตถุประสงค์" }]}
              >
                <Input.TextArea placeholder="กรอกวัตถุประสงค์" rows={2} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="สถานที่"
                name="location"
                rules={[{ required: true, message: "กรุณากรอกสถานที่" }]}
              >
                <Input.TextArea placeholder="กรอกสถานที่" rows={2} />
              </Form.Item>
            </Col>
          </Row>

          {/* ✅ แสดงวันที่แบบ พ.ศ. */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="ตั้งแต่วันที่"
                name="startDate"
                rules={[
                  { required: true, message: "กรุณาเลือกวันที่เริ่มเดินทาง" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="เลือกวันที่เริ่มเดินทาง"
                  format={(value) => formatBuddhist(value as dayjs.Dayjs)}
                  onChange={() => {
                    form.setFieldValue("endDate", null); // reset endDate เมื่อเปลี่ยน startDate
                  }}
                  disabledDate={(current) => {
                    if (!current) return false;
                    // ห้ามเลือกวันย้อนหลัง
                    if (current < dayjs().startOf("day")) return true;

                    // ตรวจสอบการทับซ้อนกับรายการใน Database
                    return oTRUser.some((maCar) => {
                      if (maCar.status === "cancel") return false; // ไม่นับรายการที่ยกเลิก

                      // ใช้ชื่อ Field ให้ตรงกับ Model: startDate และ endDate
                      const start = dayjs(maCar.startDate).startOf("day");
                      const end = dayjs(maCar.endDate).endOf("day");

                      return current.isBetween(start, end, "day", "[]");
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) => prev.startDate !== cur.startDate}
              >
                {({ getFieldValue }) => {
                  const dateStart = getFieldValue("startDate");
                  return (
                    <Form.Item
                      name="endDate"
                      label="ถึงวันที่"
                      rules={[
                        {
                          required: true,
                          message: "กรุณาเลือกวันที่สิ้นสุดการเดินทาง",
                        },
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        placeholder={
                          dateStart
                            ? `เลือกตั้งแต่ ${dayjs(dateStart).format(
                                "DD/MM/YYYY"
                              )} เป็นต้นไป`
                            : "กรุณาเลือกวันที่เริ่มเดินทางก่อน"
                        }
                        format={(value) => formatBuddhist(value as dayjs.Dayjs)}
                        disabled={!dateStart}
                        disabledDate={(current) => {
                          if (!current) return false;

                          if (
                            dateStart &&
                            current < dayjs(dateStart).startOf("day")
                          ) {
                            return true;
                          }
                          if (current < dayjs().startOf("day")) return true;

                          // ห้ามเลือกวันที่ทับกับช่วงจองรถ
                          return oTRUser.some((maCar) => {
                            const start = dayjs(maCar.startDate).startOf("day");
                            const end = dayjs(maCar.endDate).endOf("day");
                            return dayjs(current).isBetween(
                              start,
                              end,
                              "day",
                              "[]"
                            );
                          });
                        }}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <div style={{ marginBottom: 8, fontWeight: "bold" }}>
                <span style={{ color: "#ff4d4f" }}>*</span> ลักษณะการเดินทาง
              </div>
            </Col>

            <Col span={24}>
              {/* ใช้ Row ซ้อนข้างในเพื่อแบ่งพื้นที่ซ้าย-ขวาเฉพาะส่วนนี้ */}
              <Row
                gutter={24}
                align="middle"
                style={{
                  // background: "#fafafa",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                {/* ฝั่งซ้าย: รายการตัวเลือก */}
                <Col span={10}>
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
                        <Radio value="private">
                          4. รถยนต์ส่วนบุคคลหมายเลขทะเบียน
                        </Radio>
                        <Radio value="other">5. อื่น ๆ (ระบุ)</Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                {/* ฝั่งขวา: ช่องกรอกข้อมูลที่จะโผล่มาตามเงื่อนไข */}
                <Col span={14}>
                  <div
                    style={{
                      minHeight: "80px",
                      display: "flex",
                      alignItems: "center",
                      borderLeft: "1px solid #f0f0f0",
                      paddingLeft: "24px",
                    }}
                  >
                    {selectedTravelType === "official" && (
                      <Form.Item
                        label="เลือกรถราชการ"
                        name="carId"
                        style={{ width: "100%", margin: 0 }}
                        rules={[{ required: true, message: "กรุณาเลือกรถ" }]}
                      >
                        <Select placeholder="เลือกรายชื่อรถในระบบ" showSearch>
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
                        style={{ width: "100%", margin: 0 }}
                        rules={[
                          { required: true, message: "กรุณากรอกทะเบียน" },
                        ]}
                      >
                        <Input placeholder="เช่น กข 1234 ตาก" />
                      </Form.Item>
                    )}

                    {selectedTravelType === "other" && (
                      <Form.Item
                        label="ระบุรายละเอียด"
                        name="otherTravelType"
                        style={{ width: "100%", margin: 0 }}
                        rules={[{ required: true, message: "กรุณาระบุ" }]}
                      >
                        <Input placeholder="เช่น รถไฟ, เรือ" />
                      </Form.Item>
                    )}

                    {/* ถ้าเลือกข้อ 2 หรือ 3 ที่ไม่มีช่องกรอก ให้แสดงข้อความแนะนำเบาๆ หรือปล่อยว่าง */}
                    {(selectedTravelType === "bus" ||
                      selectedTravelType === "plane") && (
                      <span style={{ color: "#8c8c8c" }}>
                        ไม่ต้องกรอกข้อมูลเพิ่มเติม
                      </span>
                    )}

                    {!selectedTravelType && (
                      <span style={{ color: "#bfbfbf" }}>
                        กรุณาเลือกประเภทด้านซ้าย
                      </span>
                    )}
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="จำนวนผู้โดยสาร"
                name="passengers"
                rules={[{ required: true, message: "กรุณากรอกจำนวนผู้โดยสาร" }]}
              >
                <InputNumber
                  min={1}
                  max={10} // จำกัดค่าสูงสุดไม่เกิน 9
                  maxLength={1} // จำกัดการพิมพ์ได้เพียง 1 ตัวอักษร
                  precision={0}
                  style={{ width: "100%" }}
                  placeholder="0-9"
                  // Parser แบบเข้มงวด: รับเฉพาะตัวเลขตัวแรกที่พิมพ์เข้ามา
                  parser={(value) => {
                    const parsed = value?.replace(/\D/g, "").slice(0, 1);
                    return parsed ? parseInt(parsed, 10) : "";
                  }}
                  // บล็อก Key อื่นๆ ที่ไม่ใช่ 0-9 ทันที
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
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
                >
                  {dataUser.map((user) => (
                    <Select.Option key={user.userId} value={user.userId}>
                      {user.firstName} {user.lastName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>{" "}
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="budget"
                label="งบประมาณ"
                rules={[{ required: true, message: "กรุณาเลือกงบประมาณ" }]}
              >
                <Select
                  placeholder="เลือกงบประมาณ"
                  allowClear // เพิ่มเพื่อให้กดล้างค่าที่เลือกได้
                  style={{ width: "100%" }}
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
                <Input.TextArea placeholder="หมายเหตุเพิ่มเติม" rows={3} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: "center" }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              ยื่นคำขอ
            </Button>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </Card>
  );
}
