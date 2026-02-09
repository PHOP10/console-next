"use client";

import React, { useEffect } from "react";
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Button,
  message,
  Select,
  Card,
  Row,
  Col,
  ConfigProvider,
  Radio,
  Checkbox,
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import { useSession } from "next-auth/react";
import th_TH from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
import isBetween from "dayjs/plugin/isBetween";
import { useRouter } from "next/navigation";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { MaCarType } from "../../common";
import { buddhistLocale } from "@/app/common";

dayjs.locale("th");
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

interface MaCarBookFormProps {
  cars: any[];
  dataUser: any[];
  loading: boolean;
  fetchData: () => Promise<void>;
  maCarUser: MaCarType[];
  maCar: MaCarType[];
}

const MaCarBookForm: React.FC<MaCarBookFormProps> = ({
  cars,
  dataUser,
  loading,
  fetchData,
  maCarUser,
  maCar,
}) => {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);
  const { data: session } = useSession();
  const router = useRouter();

  const onFinish = async (values: any) => {
    try {
      const { carId, dateStart, dateEnd, typeName } = values;
      const currentUserId = session?.user?.userId;

      // ตรวจสอบการจองซ้ำ
      const isOverlaps =
        maCar &&
        maCar.some((booking) => {
          const isNotCancel = booking.status !== "cancel";
          const isTimeOverlap =
            dayjs(dateStart).isBefore(dayjs(booking.dateEnd)) &&
            dayjs(dateEnd).isAfter(dayjs(booking.dateStart));
          const isSameCarOverlap = booking.carId === carId;
          const isUserOverlap = booking.createdById === currentUserId;
          return (
            isNotCancel && isTimeOverlap && (isSameCarOverlap || isUserOverlap)
          );
        });

      if (isOverlaps) {
        const conflictType =
          maCar.find(
            (b) =>
              b.status !== "cancel" &&
              dayjs(dateStart).isBefore(dayjs(b.dateEnd)) &&
              dayjs(dateEnd).isAfter(dayjs(b.dateStart)) &&
              (b.carId === carId || b.createdById === currentUserId),
          )?.carId === carId
            ? "รถคันนี้ถูกจองในช่วงเวลานี้แล้ว"
            : "คุณมีรายการจองอื่นในช่วงเวลานี้แล้ว";

        message.warning(`ไม่สามารถจองรถได้: ${conflictType}`);
        return;
      }
      const selectedCar = cars.find((c) => c.id === carId);

      const payload = {
        ...values,
        status: "pending",
        createdName: session?.user?.fullName,
        createdById: session?.user?.userId,
        dateStart: dayjs(dateStart).toISOString(),
        dateEnd: dayjs(dateEnd).toISOString(),
        startMileage: selectedCar?.mileage ? Number(selectedCar.mileage) : 0,
      };

      await intraAuthService.createMaCar(payload);
      message.success("จองรถสำเร็จ");
      form.resetFields();

      if (typeof fetchData === "function") {
        await fetchData();
      }

      router.push("/page/ma-car/maCar?tab=2");
    } catch (err) {
      console.error("Booking Error:", err);
      message.error("เกิดข้อผิดพลาดจากระบบ ไม่สามารถดำเนินการได้");
    }
  };

  useEffect(() => {
    if (session?.user?.userId) {
      const currentNames = form.getFieldValue("passengerNames") || [];

      // ถ้ายังไม่มีชื่อตัวเองในรายการ ให้เพิ่มเข้าไปอัตโนมัติ
      if (!currentNames.includes(session.user.userId)) {
        const newNames = [...currentNames, session.user.userId];
        form.setFieldsValue({
          passengerNames: newNames,
          passengers: newNames.length, // อัปเดตตัวเลขอัตโนมัติ
        });
      }
    }
  }, [session, form]);

  // --- Style Constants (Master Template) ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  // Checkbox & Radio Style (Optional: ทำให้ดู Modern ขึ้น)
  const optionGroupStyle = "bg-gray-50 p-4 rounded-xl border border-gray-200";

  return (
    <Card className="shadow-lg rounded-2xl border-gray-100 overflow-hidden">
      <ConfigProvider locale={th_TH}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            requesterName: session?.user?.fullName,
          }}
        >
          {/* Section 1: ประเภทการเดินทาง */}
          <div className="mb-6">
            <Form.Item
              name="typeName"
              label={
                <span className="font-semibold text-gray-700">
                  ประเภทการเดินทางและแผนงาน
                </span>
              }
              rules={[
                { required: true, message: "กรุณาเลือกอย่างน้อย 1 รายการ" },
              ]}
            >
              <Checkbox.Group className={`${optionGroupStyle} w-full`}>
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <Checkbox value="ในจังหวัด">ในจังหวัด</Checkbox>
                  </Col>
                  <Col span={6}>
                    <Checkbox value="นอกจังหวัด">นอกจังหวัด</Checkbox>
                  </Col>
                  <Col span={6}>
                    <Checkbox value="แผนปกติ">แผนปกติ</Checkbox>
                  </Col>
                  <Col span={6}>
                    <Checkbox value="แผนด่วน">แผนด่วน</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </div>

          {/* Section 2: ข้อมูลรถและการใช้งาน */}
          <Row gutter={24}>
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
            <Col span={12}>
              <Form.Item
                name="purpose"
                label="วัตถุประสงค์"
                rules={[{ required: true, message: "กรุณากรอกวัตถุประสงค์" }]}
              >
                <Input.TextArea
                  placeholder="กรอกวัตถุประสงค์"
                  rows={1} // เริ่มต้น 1 บรรทัด จะขยายเอง
                  className={textAreaStyle}
                  style={{ minHeight: "44px" }}
                  maxLength={200}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="destination"
                label="สถานที่"
                rules={[{ required: true, message: "กรุณากรอกสถานที่" }]}
              >
                <Input.TextArea
                  placeholder="กรอกสถานที่"
                  rows={1}
                  className={textAreaStyle}
                  style={{ minHeight: "44px" }}
                  maxLength={200}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="budget"
                label="งบประมาณ"
                rules={[{ required: true, message: "กรุณากรอกงบประมาณ" }]}
              >
                <Select
                  placeholder="เลือกงบประมาณ"
                  className={selectStyle}
                  onChange={(value) => {
                    form.setFieldValue(
                      "budget",
                      value === "other" ? "" : value,
                    );
                  }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ display: "flex", padding: 8 }}>
                        <Input
                          placeholder="กรอกงบประมาณอื่นๆ"
                          className="rounded-lg"
                          onPressEnter={(e) => {
                            form.setFieldValue("budget", e.currentTarget.value);
                          }}
                          onBlur={(e) => {
                            form.setFieldValue("budget", e.currentTarget.value);
                          }}
                        />
                      </div>
                    </>
                  )}
                >
                  <Select.Option value="งบกลาง">งบกลาง</Select.Option>
                  <Select.Option value="งบโครงการ">งบโครงการ</Select.Option>
                  <Select.Option value="งบผู้จัด">งบผู้จัด</Select.Option>
                  <Select.Option value="เงินบำรุง">เงินบำรุง</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* 1. พนักงานขับรถ */}
            <Col span={12}>
              <Form.Item
                label="พนักงานขับรถ"
                name="driver"
                rules={[{ required: true, message: "กรุณาเลือกตัวเลือก" }]}
              >
                <div className={`${optionGroupStyle} py-2`}>
                  <Radio.Group>
                    <Radio value="yes">ขอพนักงานขับรถ</Radio>
                    <Radio value="no">ไม่ขอพนักงานขับรถ</Radio>
                  </Radio.Group>
                </div>
              </Form.Item>
            </Col>

            {/* 2. เลือกรถ */}
            <Col span={12}>
              <Form.Item
                name="carId"
                label="เลือกรถ"
                rules={[{ required: true, message: "กรุณาเลือกรถ" }]}
              >
                <Select
                  placeholder="เลือกรถ"
                  loading={loading}
                  className={selectStyle}
                >
                  {cars.map((car) => (
                    <Select.Option key={car.id} value={car.id}>
                      {car.carName} ({car.licensePlate})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          {/* Section 3: วันเวลา */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="dateStart"
                label="ตั้งแต่วันที่-เวลา"
                dependencies={["carId"]} // ✅ เพิ่ม: ให้เช็คใหม่เมื่อเปลี่ยนรถ
                rules={[
                  { required: true, message: "กรุณาเลือกวันเวลาเริ่ม" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();

                      // ดึงค่ารถที่เลือกปัจจุบัน
                      const carId = form.getFieldValue("carId");

                      // ถ้ายังไม่เลือกรถ ให้ผ่านไปก่อน หรือจะบังคับให้เลือกก็ได้
                      if (!carId) return Promise.resolve();

                      // ✅ Logic เช็คว่ารถว่างไหม (Real-time)
                      const isCarBusy = maCar.some((booking) => {
                        // ข้ามรายการที่ยกเลิก
                        if (booking.status === "cancel") return false;

                        // เช็คเฉพาะรถคันที่เราเลือก
                        if (Number(booking.carId) !== Number(carId))
                          return false;

                        const bStart = dayjs(booking.dateStart);
                        const bEnd = dayjs(booking.dateEnd);

                        // เช็คว่าเวลาที่เลือก (value) ไปแทรกอยู่ในช่วงที่รถไม่ว่างไหม
                        return value.isBetween(bStart, bEnd, null, "[]");
                      });

                      if (isCarBusy) {
                        return Promise.reject(
                          new Error("รถคันนี้ไม่ว่างในช่วงเวลานี้"),
                        );
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
                  format="DD MMMM YYYY เวลา HH:mm น."
                  placeholder="เลือกวันเวลาเริ่ม"
                  className={`${inputStyle} pt-2`}
                  onChange={() => form.setFieldValue("dateEnd", null)}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={
                  (prev, cur) =>
                    prev.dateStart !== cur.dateStart || prev.carId !== cur.carId // ✅ อัปเดตเมื่อเปลี่ยนรถด้วย
                }
              >
                {({ getFieldValue }) => {
                  const dateStart = getFieldValue("dateStart");
                  return (
                    <Form.Item
                      name="dateEnd"
                      label="ถึงวันที่-เวลา"
                      dependencies={["dateStart", "carId"]}
                      rules={[
                        { required: true, message: "กรุณาเลือกวันเวลาสิ้นสุด" },
                        {
                          validator: (_, value) => {
                            if (!value || !dateStart) return Promise.resolve();

                            const currentStart = dayjs(dateStart);
                            const currentEnd = dayjs(value);

                            // 1. เช็คเวลา Start < End
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

                            const carId = getFieldValue("carId");
                            if (carId) {
                              const isOverlap = maCar.some((booking) => {
                                if (booking.status === "cancel") return false;
                                if (Number(booking.carId) !== Number(carId))
                                  return false;

                                const bStart = dayjs(booking.dateStart);
                                const bEnd = dayjs(booking.dateEnd);

                                // สูตรเช็คชนกัน: (StartA < EndB) และ (EndA > StartB)
                                return (
                                  currentStart.isBefore(bEnd) &&
                                  currentEnd.isAfter(bStart)
                                );
                              });

                              if (isOverlap) {
                                return Promise.reject(
                                  new Error("ช่วงเวลานี้มีการจองแล้ว"),
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
                        format="DD MMMM YYYY เวลา HH:mm น."
                        placeholder={
                          dateStart
                            ? "เลือกวันเวลาสิ้นสุด"
                            : "กรุณาเลือกวันเริ่มก่อน"
                        }
                        className={`${inputStyle} pt-2`}
                        disabled={!dateStart}
                        disabledDate={(current) => {
                          // ห้ามเลือกวันก่อนวันเริ่ม
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

          <Row gutter={16}>
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
                  onChange={(values) => {
                    form.setFieldValue("passengers", values.length);
                  }}
                  onDeselect={(val) => {
                    if (val === session?.user?.userId) {
                      const current = form.getFieldValue("passengerNames");
                      setTimeout(() => {
                        const restored = [...current, val];

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
            </Col>{" "}
            <Col xs={24} sm={6}>
              <Form.Item label="จำนวนผู้โดยสาร" name="passengers">
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-1 bg-gray-50 text-gray-500`}
                  readOnly
                  controls={false}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="หมายเหตุเพิ่มเติม" name="note">
            <Input.TextArea
              placeholder="หมายเหตุเพิ่มเติม"
              rows={2}
              className={textAreaStyle}
              maxLength={200}
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "center" }}>
            <Button
              type="primary"
              htmlType="submit"
              className="h-9 px-6 rounded-lg text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              จองรถ
            </Button>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </Card>
  );
};

export default MaCarBookForm;
