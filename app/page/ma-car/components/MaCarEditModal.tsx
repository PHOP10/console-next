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
  Radio,
  Checkbox,
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
import TextArea from "antd/es/input/TextArea";
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
  const selectedCarId = form.getFieldValue("carId");

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        ...record,
        dateStart: record.dateStart ? dayjs(record.dateStart) : null,
        dateEnd: record.dateEnd ? dayjs(record.dateEnd) : null,
      });
    }
  }, [record, form]);

  // const handleSubmit = async (values: any) => {
  //   try {
  //     const payload = {
  //       ...values,
  //       id: record?.id,
  //       dateStart: values.dateStart?.toISOString() || null,
  //       dateEnd: values.dateEnd?.toISOString() || null,
  //     };
  //     await intraAuthService.updateMaCar(payload);
  //     fetchData();
  //     message.success("แก้ไขการจองสำเร็จ");
  //     onClose();
  //   } catch (error) {
  //     console.error(error);
  //     message.error("แก้ไขไม่สำเร็จ");
  //   }
  // };

  const handleSubmit = async (values: any) => {
    try {
      const { carId, dateStart, dateEnd } = values;

      // 1. ตรวจสอบการจองซ้ำ (Logic เดียวกับด้านบน แต่ต้องไม่เช็คซ้ำกับ ID ตัวเอง)
      const isOverlap =
        maCarUser &&
        maCarUser.some((booking) => {
          const isSameCar = booking.carId === carId;

          // --- จุดที่แก้ไข: ต้องไม่ใช่รายการเดิมที่กำลังแก้ไขอยู่ ---
          const isNotSelf = booking.id !== record?.id;

          const isNotCancelled =
            booking.status !== "cancel" && booking.status !== "edit";

          const isTimeOverlap =
            dayjs(dateStart)
              .startOf("day")
              .isSameOrBefore(dayjs(booking.dateEnd).endOf("day")) &&
            dayjs(dateEnd)
              .endOf("day")
              .isSameOrAfter(dayjs(booking.dateStart).startOf("day"));

          // ต้องเป็นรถคันเดียวกัน + ไม่ใช่ตัวเอง + สถานะปกติ + เวลาซ้อนทับกัน
          return isSameCar && isNotSelf && isNotCancelled && isTimeOverlap;
        });

      if (isOverlap) {
        return message.warning("ไม่สามารถจองรถคันนี้ ในช่วงเวลาที่คุณเลือกได้");
      }
      const payload = {
        ...values,
        id: record?.id,
        dateStart: values.dateStart?.toISOString() || null,
        dateEnd: values.dateEnd?.toISOString() || null,
        status: record.status === "edit" ? "pending" : record.status,
      };

      await intraAuthService.updateMaCar(payload);
      fetchData();
      message.success("แก้ไขการจองสำเร็จ");
      onClose();
    } catch (error) {
      console.error(error);
      message.error("แก้ไขไม่สำเร็จ");
    }
  };

  const formatBuddhist = (value: dayjs.Dayjs | null) => {
    if (!value) return "";
    const date = dayjs(value).locale("th");
    const day = date.date();
    const month = date.format("MMMM");
    const year = date.year() + 543;
    return `${day} ${month} ${year}`;
  };

  return (
    <Modal
      title="แก้ไขการจองรถ"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="typeName"
            label="ประเภทการเดินทางและแผนงาน"
            rules={[
              { required: true, message: "กรุณาเลือกอย่างน้อย 1 รายการ" },
            ]}
          >
            <Checkbox.Group style={{ width: "100%" }}>
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="carId"
                label="เลือกรถ"
                rules={[{ required: true }]}
              >
                <Select placeholder="เลือกรถ">
                  {cars.map((car) => (
                    <Select.Option key={car.id} value={car.id}>
                      {car.carName} ({car.licensePlate})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="เรียน"
                name="recipient"
                rules={[{ required: true, message: "กรุณากรอกเรียน..." }]}
              >
                <Select
                  placeholder="เรียน"
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
                          placeholder="กรอกอื่นๆ..."
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
                name="purpose"
                label="วัตถุประสงค์"
                rules={[{ required: true }]}
              >
                <TextArea placeholder="กรอกวัตถุประสงค์" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="destination"
                label="สถานที่"
                rules={[{ required: true }]}
              >
                <TextArea placeholder="กรอกสถานที่" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateStart"
                label="ตั้งแต่วันที่"
                rules={[
                  {
                    required: true,
                    message: "กรุณาเลือกวันที่และเวลาเริ่มจอง",
                  },
                ]}
              >
                <DatePicker
                  showTime={{ format: "HH:mm" }} // เปิดให้เลือกเวลา
                  style={{ width: "100%" }}
                  // format="DD/MMMM/YYYY HH:mm"
                  format={(value) =>
                    value
                      ? `${value.format("DD / MMMM")} / ${
                          value.year() + 543
                        } เวลา ${value.format("HH:mm")} น.`
                      : ""
                  }
                  placeholder="เลือกวันที่และเวลาเริ่ม"
                  onChange={() => {
                    form.setFieldValue("dateEnd", null);
                  }}
                  // ป้องกันการเลือก "วันที่" ย้อนหลัง
                  disabledDate={(current) => {
                    if (!current) return false;
                    return current < dayjs().startOf("day");
                    // หมายเหตุ: ตรงนี้ไม่ต้องเช็ค maCarUser.some เพราะเป็นการจองของตัวเอง
                    // หากต้องการเช็คซ้ำกับคนอื่น ต้องใส่ Logic car.id !== record.id เพิ่ม
                  }}
                  // ป้องกันการเลือก "เวลา" ย้อนหลัง (กรณีเลือกวันปัจจุบัน)
                  disabledTime={(current) => {
                    if (current && current.isSame(dayjs(), "day")) {
                      return {
                        disabledHours: () =>
                          Array.from({ length: dayjs().hour() }, (_, i) => i),
                        disabledMinutes: (selectedHour) => {
                          if (selectedHour === dayjs().hour()) {
                            return Array.from(
                              { length: dayjs().minute() },
                              (_, i) => i
                            );
                          }
                          return [];
                        },
                      };
                    }
                    return {};
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) => prev.dateStart !== cur.dateStart}
              >
                {({ getFieldValue }) => {
                  const dateStart = getFieldValue("dateStart");
                  return (
                    <Form.Item
                      name="dateEnd"
                      label="ถึงวันที่"
                      rules={[
                        {
                          required: true,
                          message: "กรุณาเลือกวันที่และเวลาสิ้นสุด",
                        },
                      ]}
                    >
                      <DatePicker
                        showTime={{ format: "HH:mm" }}
                        style={{ width: "100%" }}
                        format={(value) =>
                          value
                            ? `${value.format("DD / MMMM")} / ${
                                value.year() + 543
                              } เวลา ${value.format("HH:mm")} น.`
                            : ""
                        }
                        disabled={!dateStart}
                        placeholder={
                          dateStart
                            ? "เลือกวันที่และเวลาสิ้นสุด"
                            : "กรุณาเลือกวันเริ่มก่อน"
                        }
                        // ป้องกันวันที่ย้อนหลัง และห้ามเลือกก่อนวันเริ่ม
                        disabledDate={(current) => {
                          if (!current) return false;
                          const today = dayjs().startOf("day");
                          const startDay = dateStart
                            ? dayjs(dateStart).startOf("day")
                            : today;
                          return current < today || current < startDay;
                        }}
                        // ป้องกันเวลาสิ้นสุดย้อนหลัง (ถ้าเลือกวันเดียวกับวันเริ่ม ห้ามเลือกเวลาน้อยกว่าเวลาเริ่ม)
                        disabledTime={(current) => {
                          if (
                            current &&
                            dateStart &&
                            current.isSame(dayjs(dateStart), "day")
                          ) {
                            const startHour = dayjs(dateStart).hour();
                            const startMinute = dayjs(dateStart).minute();
                            return {
                              disabledHours: () =>
                                Array.from({ length: startHour }, (_, i) => i),
                              disabledMinutes: (selectedHour) => {
                                if (selectedHour === startHour) {
                                  return Array.from(
                                    { length: startMinute },
                                    (_, i) => i
                                  );
                                }
                                return [];
                              },
                            };
                          }
                          return {};
                        }}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="พนักงานขับรถ"
                name="driver"
                rules={[{ required: true, message: "กรุณาเลือกตัวเลือก" }]}
              >
                <Radio.Group>
                  <Radio value="yes">ขอพนักงานขับรถส่วนกลาง</Radio>
                  <Radio value="no">ไม่ขอพนักงานขับรถส่วนกลาง</Radio>
                </Radio.Group>
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
                  onChange={(value) => {
                    form.setFieldValue(
                      "budget",
                      value === "other" ? "" : value
                    );
                  }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ display: "flex", padding: 8 }}>
                        <Input
                          placeholder="กรอกงบประมาณอื่นๆ"
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
                  <Select.Option value="other">อื่นๆ...</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="passengers"
                label="จำนวนผู้โดยสาร"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="กรอกจำนวนผู้โดยสาร"
                />
              </Form.Item>
            </Col>{" "}
            <Col span={16}>
              <Form.Item
                name="passengerNames"
                label="ชื่อผู้โดยสาร"
                rules={[{ required: true, message: "กรุณาเลือกผู้ใช้รถ" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="เลือกผู้ใช้รถ"
                  // loading={loading}
                  options={dataUser.map((u) => ({
                    label: `${u.firstName} ${u.lastName}`,
                    value: u.userId,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="หมายเหตุเพิ่มเติม" name="note">
            <Input.TextArea placeholder="หมายเหตุเพิ่มเติม" rows={3} />
          </Form.Item>
          <Form.Item style={{ textAlign: "center" }}>
            <Button type="primary" htmlType="submit">
              บันทึก
            </Button>
            <Button onClick={onClose} style={{ marginLeft: 8 }}>
              ยกเลิก
            </Button>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </Modal>
  );
};

export default MaCarEditModal;
