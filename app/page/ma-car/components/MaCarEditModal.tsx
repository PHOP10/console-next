"use client";

import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  message,
  Button,
  Row,
  Col,
  ConfigProvider,
  Checkbox,
  Radio,
  Divider,
} from "antd";
import dayjs from "dayjs";
import th_TH from "antd/locale/th_TH";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { MaCarType } from "../../common";
import "dayjs/locale/th";
import isBetween from "dayjs/plugin/isBetween";
import { buddhistLocale } from "@/app/common";
import { useSession } from "next-auth/react";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale("th");
dayjs.extend(isBetween);

interface MaCarEditModalProps {
  open: boolean;
  onClose: () => void;
  record: any;
  cars: any[];
  dataUser: any[];
  fetchData: () => void;
  data: any[];
  maCarUser: MaCarType[];
}

const MaCarEditModal: React.FC<MaCarEditModalProps> = ({
  open,
  onClose,
  record,
  cars,
  dataUser,
  fetchData,
  data,
  maCarUser,
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);
  const [form] = Form.useForm();
  const { data: session } = useSession();

  useEffect(() => {
    if (record && open) {
      form.setFieldsValue({
        ...record,
        dateStart: record.dateStart ? dayjs(record.dateStart) : null,
        dateEnd: record.dateEnd ? dayjs(record.dateEnd) : null,
        passengerNames: record.passengerNames || [],
        typeName: Array.isArray(record.typeName)
          ? record.typeName
          : [record.typeName],
      });
    }
  }, [record, open, form]);

  const handleSubmit = async (values: any) => {
    try {
      const { carId, dateStart, dateEnd } = values;
      const currentUserId = session?.user?.userId;

      // ✅ อัปเดตการเช็คก่อนบันทึกให้ครอบคลุมแบบเดียวกับหน้า Form
      const isOverlap = data?.some((booking) => {
        // ข้ามตัวที่ถูกยกเลิก และข้าม "ใบจองปัจจุบันที่กำลังแก้ไข"
        if (booking.id === record?.id || booking.status === "cancel")
          return false;

        const isSameCar = Number(booking.carId) === Number(carId);
        const isSameUser = booking.createdById === currentUserId;

        if (!isSameCar && !isSameUser) return false;

        const bStart = dayjs(booking.dateStart);
        const bEnd = dayjs(booking.dateEnd);
        const currentStart = dayjs(dateStart);
        const currentEnd = dayjs(dateEnd);

        // สูตรเช็คชนกัน
        return currentStart.isBefore(bEnd) && currentEnd.isAfter(bStart);
      });

      if (isOverlap) {
        return message.warning(
          "ไม่สามารถแก้ไขได้: มีการจองรถในช่วงเวลานี้ซ้ำซ้อน",
        );
      }

      const selectedCar = cars.find((c) => c.id === carId);
      const payload = {
        ...values,
        id: record?.id,
        dateStart: dayjs(dateStart).toISOString(),
        dateEnd: dayjs(dateEnd).toISOString(),
        status: record.status === "edit" ? "resubmitted" : record.status,
        startMileage:
          carId !== record?.carId
            ? selectedCar?.mileage || 0
            : record?.startMileage || 0,
      };

      await intraAuthService.updateMaCar(payload);
      message.success("แก้ไขการจองสำเร็จ");
      fetchData();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("แก้ไขไม่สำเร็จ");
    }
  };

  // --- Style Constants ---
  const inputStyle =
    "w-full h-10 sm:h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 transition-all duration-300 text-sm";
  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 transition-all duration-300 text-sm";
  const selectStyle =
    "h-10 sm:h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 hover:[&>.ant-select-selector]:!border-blue-400 text-sm";
  const optionGroupStyle =
    "bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200";

  return (
    <Modal
      title={
        <div className="text-lg sm:text-xl font-bold text-[#0683e9] text-center w-full">
          แก้ไขการจองรถ
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      style={{ maxWidth: "100%", top: 20, paddingBottom: 0 }}
      styles={{ content: { borderRadius: "16px", padding: "16px sm:24px" } }}
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Section 1: ประเภทการเดินทาง */}
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
              <Row gutter={[8, 8]}>
                <Col xs={12} sm={6}>
                  <Checkbox value="ในจังหวัด">ในจังหวัด</Checkbox>
                </Col>
                <Col xs={12} sm={6}>
                  <Checkbox value="นอกจังหวัด">นอกจังหวัด</Checkbox>
                </Col>
                <Col xs={12} sm={6}>
                  <Checkbox value="แผนปกติ">แผนปกติ</Checkbox>
                </Col>
                <Col xs={12} sm={6}>
                  <Checkbox value="แผนด่วน">แผนด่วน</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          {/* Section 2: ข้อมูลพื้นฐาน */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="recipient"
                label="เรียน"
                rules={[{ required: true }]}
              >
                <Select placeholder="เลือกผู้รับ" className={selectStyle}>
                  <Select.Option value="สาธารณสุขอำเภอวังเจ้า">
                    สาธารณสุขอำเภอวังเจ้า
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="budget"
                label="งบประมาณ"
                rules={[{ required: true }]}
              >
                <Select placeholder="เลือกงบประมาณ" className={selectStyle}>
                  <Select.Option value="งบกลาง">งบกลาง</Select.Option>
                  <Select.Option value="งบโครงการ">งบโครงการ</Select.Option>
                  <Select.Option value="เงินบำรุง">เงินบำรุง</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="purpose"
                label="วัตถุประสงค์"
                rules={[{ required: true }]}
              >
                <Input.TextArea
                  placeholder="กรอกวัตถุประสงค์"
                  rows={1}
                  className={textAreaStyle}
                  style={{ minHeight: "44px" }}
                  maxLength={200}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="destination"
                label="สถานที่"
                rules={[{ required: true }]}
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
          </Row>

          {/* Section 3: ข้อมูลรถและคนขับ */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="พนักงานขับรถ"
                name="driver"
                rules={[{ required: true }]}
              >
                <Radio.Group
                  className={`${optionGroupStyle} py-2 w-full flex justify-around`}
                >
                  <Radio value="yes">ขอ</Radio>
                  <Radio value="no">ไม่ขอ</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="carId"
                label="เลือกรถ"
                rules={[{ required: true }]}
              >
                <Select placeholder="เลือกรถ" className={selectStyle}>
                  {cars.map((car) => (
                    <Select.Option key={car.id} value={car.id}>
                      {car.carName} ({car.licensePlate})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* ✅ Section 4: วันเวลาเดินทาง (แก้ไข Logic เช็คเวลาให้เหมือนหน้าสร้าง) */}
          <div className="bg-blue-50/30 p-3 sm:p-4 rounded-xl border border-blue-100 mb-4">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="dateStart"
                  label="ตั้งแต่วันที่-เวลา"
                  dependencies={["dateEnd", "carId"]}
                  rules={[
                    { required: true, message: "กรุณาเลือกวันเวลาเริ่ม" },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();

                        const carId = form.getFieldValue("carId");
                        if (!carId) return Promise.resolve();

                        const dateEnd = form.getFieldValue("dateEnd");
                        const currentStart = dayjs(value);
                        const currentUserId = session?.user?.userId;

                        let errorMsg = "";

                        // ✅ ใช้ data ในการเช็ค (ข้อมูลการจองทั้งหมดที่ดึงมา)
                        const isConflict = data?.some((booking) => {
                          // 🚨 สำคัญมาก: ข้าม record ปัจจุบันที่กำลังแก้ไข และที่ยกเลิกไปแล้ว
                          if (
                            booking.id === record?.id ||
                            booking.status === "cancel"
                          )
                            return false;

                          const isSameCar =
                            Number(booking.carId) === Number(carId);
                          const isSameUser =
                            booking.createdById === currentUserId;

                          if (!isSameCar && !isSameUser) return false;

                          const bStart = dayjs(booking.dateStart);
                          const bEnd = dayjs(booking.dateEnd);

                          if (dateEnd) {
                            const currentEnd = dayjs(dateEnd);
                            if (
                              currentStart.isBefore(bEnd) &&
                              currentEnd.isAfter(bStart)
                            ) {
                              errorMsg = isSameCar
                                ? "รถคันนี้มีการจองในช่วงเวลานี้แล้ว"
                                : "คุณมีรายการจองรถในช่วงเวลานี้แล้ว";
                              return true;
                            }
                          } else {
                            if (
                              currentStart.isSameOrAfter(bStart) &&
                              currentStart.isBefore(bEnd)
                            ) {
                              errorMsg = isSameCar
                                ? "รถคันนี้มีการจองในช่วงเวลานี้แล้ว"
                                : "คุณมีรายการจองรถในช่วงเวลานี้แล้ว";
                              return true;
                            }
                          }
                          return false;
                        });

                        if (isConflict) {
                          return Promise.reject(new Error(errorMsg));
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
                    format="DD MMMM YYYY เวลา HH:mm น."
                    className={`${inputStyle} pt-1 w-full`}
                    onChange={() => form.setFieldValue("dateEnd", null)}
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, cur) =>
                    prev.dateStart !== cur.dateStart || prev.carId !== cur.carId
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
                          {
                            required: true,
                            message: "กรุณาเลือกวันเวลาสิ้นสุด",
                          },
                          {
                            validator: (_, value) => {
                              if (!value || !dateStart)
                                return Promise.resolve();

                              const carId = getFieldValue("carId");
                              if (!carId) return Promise.resolve();

                              const currentStart = dayjs(dateStart);
                              const currentEnd = dayjs(value);
                              const currentUserId = session?.user?.userId;

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

                              let errorMsg = "";
                              const isConflict = data?.some((booking) => {
                                // 🚨 สำคัญมาก: ข้าม record ปัจจุบันที่กำลังแก้ไข
                                if (
                                  booking.id === record?.id ||
                                  booking.status === "cancel"
                                )
                                  return false;

                                const isSameCar =
                                  Number(booking.carId) === Number(carId);
                                const isSameUser =
                                  booking.createdById === currentUserId;

                                if (!isSameCar && !isSameUser) return false;

                                const bStart = dayjs(booking.dateStart);
                                const bEnd = dayjs(booking.dateEnd);

                                if (
                                  currentStart.isBefore(bEnd) &&
                                  currentEnd.isAfter(bStart)
                                ) {
                                  errorMsg = isSameCar
                                    ? "รถคันนี้มีการจองในช่วงเวลานี้แล้ว"
                                    : "คุณมีรายการจองรถในช่วงเวลานี้แล้ว";
                                  return true;
                                }
                                return false;
                              });

                              if (isConflict) {
                                return Promise.reject(new Error(errorMsg));
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
                          format="DD MMMM YYYY เวลา HH:mm น."
                          className={`${inputStyle} pt-1 w-full`}
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

          {/* Section 5: ผู้โดยสาร */}
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

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              onClick={onClose}
              className="rounded-lg h-10 px-6 w-full sm:w-auto"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="rounded-lg h-10 px-6 bg-[#0683e9] w-full sm:w-auto"
            >
              บันทึกการแก้ไข
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
};

export default MaCarEditModal;
