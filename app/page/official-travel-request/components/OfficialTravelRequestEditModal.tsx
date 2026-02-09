"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  message,
  ConfigProvider,
  Row,
  Col,
  Button,
  Radio,
  Space,
} from "antd";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";
import {
  UserType,
  MasterCarType,
  OfficialTravelRequestType,
} from "../../common";
import th_TH from "antd/locale/th_TH";
import "dayjs/locale/th";
import isBetween from "dayjs/plugin/isBetween";
import { buddhistLocale } from "@/app/common";

dayjs.locale("th");
dayjs.extend(isBetween);

interface Props {
  open: boolean;
  onClose: () => void;
  record: OfficialTravelRequestType | null;
  fetchData: () => void;
  dataUser: UserType[];
  cars: MasterCarType[];
  dataOTR: OfficialTravelRequestType[];
}

const OfficialTravelRequestEditModal: React.FC<Props> = ({
  open,
  onClose,
  record,
  fetchData,
  dataUser,
  cars,
  dataOTR,
}) => {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const service = officialTravelRequestService(intraAuth);
  const [submitting, setSubmitting] = useState(false);

  // Watch ค่าเหล่านี้เพื่อใช้ใน Validator (Real-time check)
  const selectedTravelType = Form.useWatch("travelType", form);
  const selectedCarId = Form.useWatch("carId", form);

  useEffect(() => {
    if (record && open) {
      form.setFieldsValue({
        ...record,
        startDate: record.startDate ? dayjs(record.startDate) : null,
        endDate: record.endDate ? dayjs(record.endDate) : null,
        travelType:
          record.travelType && record.travelType.length > 0
            ? record.travelType[0]
            : null,
      });
    } else {
      form.resetFields();
    }
  }, [record, open, form]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const { carId, startDate, endDate, travelType } = values;

      const currentStart = dayjs(startDate);
      const currentEnd = dayjs(endDate);

      // --- Logic 1: เช็คการชนกัน (Overlap) ก่อนบันทึก ---
      const isCarOverlaps =
        dataOTR &&
        dataOTR.some((booking) => {
          // 1. ข้ามรายการที่ยกเลิก และ ข้ามรายการตัวเอง (สำคัญมากสำหรับการแก้ไข)
          if (booking.status === "cancel" || booking.id === record?.id)
            return false;

          // 2. ถ้าไม่ใช่รถราชการ ไม่ต้องเช็ค
          if (travelType !== "official") return false;

          // 3. เช็คว่าเป็นรถคันเดียวกันหรือไม่
          if (!carId || Number(booking.carId) !== Number(carId)) {
            return false;
          }

          const bStart = dayjs(booking.startDate);
          const bEnd = dayjs(booking.endDate);

          // 4. เช็คช่วงเวลาชนกัน (Time Overlap) แบบละเอียด
          const isTimeOverlap =
            currentStart.isBefore(bEnd) && currentEnd.isAfter(bStart);

          return isTimeOverlap;
        });

      if (isCarOverlaps) {
        message.warning("รถคันนี้ถูกจองโดยผู้อื่นในช่วงเวลานี้แล้ว");
        setSubmitting(false);
        return;
      }

      // --- Prepare Payload ---
      const payload = {
        ...values,
        id: record?.id,
        startDate: values.startDate?.toISOString() || null,
        endDate: values.endDate?.toISOString() || null,
        travelType: values.travelType ? [values.travelType] : [],
        status: "pending",
        carId: values.travelType === "official" ? values.carId : null,
        privateCarId:
          values.travelType === "private" ? values.privateCarId : null,
        otherTravelType:
          values.travelType === "other" ? values.otherTravelType : null,
      };

      await service.updateOfficialTravelRequest(payload);
      message.success("แก้ไขคำขอสำเร็จ");
      fetchData();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("แก้ไขคำขอไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const formatBuddhist = (date: dayjs.Dayjs | null) => {
    if (!date) return "";
    const d = dayjs(date).locale("th");
    return `${d.date()} ${d.format("MMMM")} ${d.year() + 543} เวลา ${d.format(
      "HH:mm",
    )} น.`;
  };

  // --- Style Constants ---
  const inputStyle =
    "w-full h-10 sm:h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-sm";
  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-sm";
  const selectStyle =
    "h-10 sm:h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400 text-sm";
  const optionGroupStyle =
    "bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200";

  return (
    <Modal
      title={
        <div className="text-lg sm:text-xl font-bold text-[#0683e9] text-center w-full mb-4">
          แก้ไขคำขอไปราชการ
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      // Responsive Modal
      style={{ maxWidth: "100%", top: 20, paddingBottom: 0 }}
      styles={{
        content: { borderRadius: "16px", padding: "16px sm:24px" },
        header: { borderBottom: "1px solid #f0f0f0", marginBottom: "16px" },
      }}
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                  { pattern: /^[ก-ฮ0-9./\s]+$/, message: "รูปแบบไม่ถูกต้อง" },
                  {
                    validator: (_, value) => {
                      if (
                        value &&
                        dataOTR?.some(
                          (doc) =>
                            doc.documentNo === value && doc.id !== record?.id,
                        )
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
                  placeholder="เช่น ตก 0933.1/85"
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
                  placeholder="กรอกเรียน"
                  className={selectStyle}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ display: "flex", padding: 8 }}>
                        <Input
                          placeholder="กรอกอื่น ๆ ..."
                          onPressEnter={(e) =>
                            form.setFieldValue(
                              "recipient",
                              e.currentTarget.value,
                            )
                          }
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
                rules={[{ required: true, message: "กรุณากรอกข้อมูล" }]}
              >
                <Input.TextArea rows={2} className={textAreaStyle} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="สถานที่"
                name="location"
                rules={[{ required: true, message: "กรุณากรอกข้อมูล" }]}
              >
                <Input.TextArea rows={2} className={textAreaStyle} />
              </Form.Item>
            </Col>
          </Row>

          {/* Section 2: วันเวลาเดินทาง */}
          <div className="bg-blue-50/30 p-3 sm:p-4 rounded-xl border border-blue-100 mb-6 mt-2">
            <Row gutter={16}>
              {/* --- 1. วันที่เริ่มต้น --- */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="ตั้งแต่วันที่-เวลา"
                  name="startDate"
                  dependencies={["carId", "travelType"]}
                  rules={[
                    {
                      required: true,
                      message: "กรุณาเลือกวันที่เริ่มเดินทาง",
                    },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const currentTravelType =
                          form.getFieldValue("travelType");
                        const currentCarId = form.getFieldValue("carId");

                        if (currentTravelType === "official" && currentCarId) {
                          const isCarBusy = (dataOTR || []).some((booking) => {
                            if (
                              booking.status === "cancel" ||
                              booking.id === record?.id
                            )
                              return false;
                            if (Number(booking.carId) !== Number(currentCarId))
                              return false;

                            const bStart = dayjs(booking.startDate);
                            const bEnd = dayjs(booking.endDate);
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
                    onChange={() => form.setFieldValue("endDate", null)}
                    disabledDate={(current) => {
                      return current && current < dayjs().startOf("day");
                    }}
                  />
                </Form.Item>
              </Col>

              {/* --- 2. วันที่สิ้นสุด --- */}
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

                              const travelType = getFieldValue("travelType");
                              const carId = getFieldValue("carId");

                              if (travelType === "official" && carId) {
                                const isCarOverlap = (dataOTR || []).some(
                                  (booking) => {
                                    if (
                                      booking.status === "cancel" ||
                                      booking.id === record?.id
                                    )
                                      return false;
                                    if (Number(booking.carId) !== Number(carId))
                                      return false;

                                    const bStart = dayjs(booking.startDate);
                                    const bEnd = dayjs(booking.endDate);
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
            <div className="mb-2 font-bold text-gray-700">ลักษณะการเดินทาง</div>
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
                        <Radio value="bus">2. รถยนต์โดยสารประจำทาง</Radio>
                        <Radio value="plane">3. เครื่องบินโดยสาร</Radio>
                        <Radio value="private">4. รถยนต์ส่วนบุคคล</Radio>
                        <Radio value="other">5. อื่น ๆ</Radio>
                      </Space>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                {/* Dynamic Inputs */}
                <Col xs={24} sm={12}>
                  <div className="flex items-center h-full pl-0 sm:pl-6 border-l-0 sm:border-l border-gray-200 mt-4 sm:mt-0">
                    <div className="w-full">
                      {selectedTravelType === "official" && (
                        <Form.Item
                          label="เลือกรถราชการ"
                          name="carId"
                          rules={[{ required: true, message: "กรุณาเลือกรถ" }]}
                        >
                          <Select
                            placeholder="เลือกรถ"
                            className={selectStyle}
                            showSearch
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
                            placeholder="เช่น กข 1234"
                            className={inputStyle}
                          />
                        </Form.Item>
                      )}

                      {selectedTravelType === "other" && (
                        <Form.Item
                          label="ระบุรายละเอียด"
                          name="otherTravelType"
                          rules={[{ required: true }]}
                        >
                          <Input
                            placeholder="เช่น รถไฟ"
                            className={inputStyle}
                          />
                        </Form.Item>
                      )}

                      {!selectedTravelType && (
                        <div className="text-gray-400 text-center">
                          กรุณาเลือกประเภทด้านซ้าย/ด้านบน
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          {/* Section 4: ผู้โดยสารและงบประมาณ */}
          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Form.Item
                label="จำนวน"
                name="passengers"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: "100%" }}
                  className={inputStyle}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={18}>
              <Form.Item label="รายชื่อผู้โดยสาร" name="passengerNames">
                <Select
                  mode="multiple"
                  className={selectStyle}
                  maxTagCount="responsive"
                  optionFilterProp="children"
                >
                  {dataUser.map((u) => (
                    <Select.Option key={u.userId} value={u.userId}>
                      {u.firstName} {u.lastName}
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
                rules={[{ required: true }]}
              >
                <Select className={selectStyle}>
                  <Select.Option value="งบกลาง">งบกลาง</Select.Option>
                  <Select.Option value="งบโครงการ">งบโครงการ</Select.Option>
                  <Select.Option value="งบผู้จัด">งบผู้จัด</Select.Option>
                  <Select.Option value="เงินบำรุง">เงินบำรุง</Select.Option>
                  <Select.Option value="ไม่ขอเบิก">ไม่ขอเบิก</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={18}>
              <Form.Item label="หมายเหตุ" name="note">
                <Input.TextArea rows={1} className={textAreaStyle} />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              onClick={onClose}
              className="h-10 px-6 rounded-lg w-full sm:w-auto"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="h-10 px-6 rounded-lg bg-[#0683e9] w-full sm:w-auto"
            >
              บันทึกการแก้ไข
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
};

export default OfficialTravelRequestEditModal;
