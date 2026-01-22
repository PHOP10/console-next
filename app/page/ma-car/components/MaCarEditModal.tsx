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

  useEffect(() => {
    if (record && open) {
      // แปลงข้อมูลให้ตรง format ก่อน set ลง Form
      form.setFieldsValue({
        ...record,
        dateStart: record.dateStart ? dayjs(record.dateStart) : null,
        dateEnd: record.dateEnd ? dayjs(record.dateEnd) : null,
        // ตรวจสอบ array ของผู้โดยสาร (เผื่อ backend ส่งมาเป็น null)
        passengerNames: record.passengerNames || [],
      });
    }
  }, [record, open, form]);

  const handleSubmit = async (values: any) => {
    try {
      const { carId, dateStart, dateEnd } = values;

      const isOverlap =
        maCarUser &&
        maCarUser.some((booking) => {
          const isSameCar = booking.carId === carId;
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

  // --- Style Constants ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  const optionGroupStyle = "bg-gray-50 p-4 rounded-xl border border-gray-200";

  return (
    <Modal
      title={
        <div className="text-xl font-bold text-[#0683e9] text-center w-full">
          แก้ไขการจองรถ
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={750}
      centered
      styles={{
        content: { borderRadius: "20px", padding: "24px" },
        header: {
          marginBottom: "16px",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "12px",
        },
      }}
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Section 1: ประเภทการเดินทาง */}
          <div className="mb-4">
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
          </div>

          {/* Section 2: ข้อมูลรถและผู้เรียน */}
          <Row gutter={24}>
            <Col span={12}>
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
            <Col span={12}>
              <Form.Item
                label="เรียน"
                name="recipient"
                rules={[{ required: true, message: "กรุณากรอกเรียน..." }]}
              >
                <Select
                  placeholder="เรียน"
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
                          placeholder="กรอกอื่นๆ..."
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
                name="purpose"
                label="วัตถุประสงค์"
                rules={[{ required: true }]}
              >
                <Input.TextArea
                  placeholder="กรอกวัตถุประสงค์"
                  rows={1}
                  className={textAreaStyle}
                  style={{ minHeight: "44px" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
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
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Section 3: วันเวลาเดินทาง */}
          <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 mb-4 mt-2">
            <Row gutter={24}>
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
                  style={{ marginBottom: 0 }}
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
                    placeholder="เลือกวันที่และเวลาเริ่ม"
                    className={`${inputStyle} pt-2`}
                    onChange={() => {
                      form.setFieldValue("dateEnd", null);
                    }}
                    disabledDate={(current) => {
                      if (!current) return false;
                      // ในหน้าแก้ไข อาจยอมให้เห็นวันเก่าได้ ถ้าต้องการ แต่ปกติไม่ควรแก้เป็นวันในอดีต
                      return current < dayjs().startOf("day");
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
                        style={{ marginBottom: 0 }}
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
                          className={`${inputStyle} pt-2`}
                          disabledDate={(current) => {
                            if (!current) return false;
                            const today = dayjs().startOf("day");
                            const startDay = dateStart
                              ? dayjs(dateStart).startOf("day")
                              : today;
                            return current < today || current < startDay;
                          }}
                        />
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Section 4: ข้อมูลเพิ่มเติม */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="พนักงานขับรถ"
                name="driver"
                rules={[{ required: true, message: "กรุณาเลือกตัวเลือก" }]}
              >
                {/* ✅ แก้ไขตรงนี้: ลบ div ครอบออก เพื่อให้ Form.Item ส่งค่าให้ Radio.Group โดยตรง */}
                <Radio.Group className={`${optionGroupStyle} py-2 w-full`}>
                  <Radio value="yes">ขอพนักงานขับรถ</Radio>
                  <Radio value="no">ไม่ขอพนักงานขับรถ</Radio>
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

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="passengers"
                label="จำนวนผู้โดยสาร"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="ระบุจำนวน"
                  className={`${inputStyle} pt-1`}
                />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="passengerNames"
                label="ชื่อผู้โดยสาร"
                rules={[{ required: true, message: "กรุณาเลือกผู้ใช้รถ" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="เลือกผู้ใช้รถ"
                  className={selectStyle}
                  maxTagCount="responsive"
                  options={dataUser.map((u) => ({
                    label: `${u.firstName} ${u.lastName}`,
                    value: u.userId,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="หมายเหตุเพิ่มเติม" name="note">
            <Input.TextArea
              placeholder="หมายเหตุเพิ่มเติม"
              rows={2}
              className={textAreaStyle}
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              onClick={onClose}
              className="h-10 px-6 rounded-lg text-gray-600 hover:bg-gray-100 border-gray-300"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0"
            >
              บันทึก
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
};

export default MaCarEditModal;
