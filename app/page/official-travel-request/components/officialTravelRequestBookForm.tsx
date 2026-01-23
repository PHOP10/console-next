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
  Divider,
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
import { SaveOutlined } from "@ant-design/icons";

dayjs.locale("th");
dayjs.extend(isBetween);

import { ExperimentOutlined } from "@ant-design/icons"; /* อันใหม่ */

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
  // const selectedTravelType = Form.useWatch("travelType", form);

  // State สำหรับ Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<any>(null);

  const selectedTravelType = Form.useWatch("travelType", form);

  // 1. กดปุ่มบันทึก -> ตรวจสอบเงื่อนไข -> เปิด Modal
  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const { carId, startDate, endDate, travelType } = values;

      const isCarOverlaps =
        dataOTR &&
        dataOTR.some((booking) => {
          if (booking.status === "cancel") return false;

          const start = dayjs(startDate).startOf("day");
          const end = dayjs(endDate).endOf("day");
          const bStart = dayjs(booking.startDate).startOf("day");
          const bEnd = dayjs(booking.endDate).endOf("day");

          const isTimeOverlap = start.isBefore(bEnd) && end.isAfter(bStart);

          const isSameCarOverlap =
            travelType === "official" &&
            carId &&
            Number(booking.carId) === Number(carId);

          return isTimeOverlap && isSameCarOverlap;
        });

      if (isCarOverlaps) {
        message.warning(
          "ไม่สามารถดำเนินรายการได้: รถหมายเลขทะเบียนนี้มีการจองไว้แล้วในวันที่เลือก",
        );
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

  // --- Master Template Styles ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  const optionGroupStyle = "bg-gray-50 p-4 rounded-xl border border-gray-200";

  /* --------------------------------------------ข้อมูลตัวอย่างอัตโนมัติ (Auto Fill)------------------------- */
  const handleAutoFill = () => {
    // 1. สุ่มเลขที่เอกสาร
    const randomNum = Math.floor(Math.random() * 10000);
    const docNo = `${randomNum}/2569`;

    // 2. สุ่มวันที่ (เริ่มพรุ่งนี้)
    const start = dayjs().add(1, "day");
    const end = dayjs().add(Math.floor(Math.random() * 3) + 1, "day");

    // 3. สุ่มประเภทการเดินทาง
    const travelTypes = ["official", "bus", "plane", "private", "other"];
    const selectedType =
      travelTypes[Math.floor(Math.random() * travelTypes.length)];

    // 4. เตรียมข้อมูลเฉพาะของแต่ละประเภทเดินทาง
    let extraFields = {};
    if (selectedType === "official" && cars.length > 0) {
      // สุ่มรถ 1 คัน
      const randomCar = cars[Math.floor(Math.random() * cars.length)];
      extraFields = { carId: randomCar.id };
    } else if (selectedType === "private") {
      extraFields = { privateCarId: "กข 9999 ตาก" };
    } else if (selectedType === "other") {
      extraFields = { otherTravelType: "เรือด่วนเจ้าพระยา" };
    }

    // 5. สุ่มผู้โดยสาร (1-3 คน) จาก dataUser
    const shuffledUsers = [...dataUser].sort(() => 0.5 - Math.random());
    const selectedUsers = shuffledUsers.slice(
      0,
      Math.floor(Math.random() * 3) + 1,
    );
    const passengerIds = selectedUsers.map((u) => u.userId);

    // 6. Set ค่าเข้า Form
    form.setFieldsValue({
      documentNo: docNo,
      recipient: "สาธารณสุขอำเภอวังเจ้า",
      missionDetail: "เข้าร่วมประชุมเชิงปฏิบัติการเพื่อพัฒนาระบบบริการสุขภาพ",
      location: "สำนักงานสาธารณสุขจังหวัดเชียงใหม่",
      startDate: start,
      endDate: end,
      travelType: selectedType,
      passengers: passengerIds.length,
      passengerNames: passengerIds,
      budget: "งบกลาง",
      note: "ข้อมูลตัวอย่างสำหรับการทดสอบระบบ (Auto Generated)",
      ...extraFields, // Spread ค่าที่สุ่มมาเฉพาะประเภท
    });
  };

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
                normalize={(value) => value.replace(/[^0-9./]/g, "")}
                rules={[
                  { required: true, message: "กรุณากรอกเลขที่เอกสาร" },
                  {
                    pattern: /^[0-9./]+$/,
                    message: "กรอกได้เฉพาะตัวเลข จุด (.) และทับ (/) เท่านั้น",
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
                  placeholder="เช่น 0999.9.9/99"
                  maxLength={12}
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
          <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 mb-6 mt-2">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="ตั้งแต่วันที่"
                  name="startDate"
                  rules={[
                    { required: true, message: "กรุณาเลือกวันที่เริ่มเดินทาง" },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="เลือกวันที่เริ่ม"
                    format={(value) => formatBuddhist(value as dayjs.Dayjs)}
                    className={`${inputStyle} pt-2`}
                    onChange={() => form.setFieldValue("endDate", null)}
                    disabledDate={(current) => {
                      if (!current) return false;
                      if (current < dayjs().startOf("day")) return true;
                      return oTRUser.some((maCar) => {
                        if (maCar.status === "cancel") return false;
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
                            message: "กรุณาเลือกวันที่สิ้นสุด",
                          },
                        ]}
                        style={{ marginBottom: 0 }}
                      >
                        <DatePicker
                          style={{ width: "100%" }}
                          placeholder={
                            dateStart ? `เลือกถึงวันที่` : "เลือกวันเริ่มก่อน"
                          }
                          format={(value) =>
                            formatBuddhist(value as dayjs.Dayjs)
                          }
                          className={`${inputStyle} pt-2`}
                          disabled={!dateStart}
                          disabledDate={(current) => {
                            if (!current) return false;
                            if (
                              dateStart &&
                              current < dayjs(dateStart).startOf("day")
                            )
                              return true;
                            if (current < dayjs().startOf("day")) return true;
                            return oTRUser.some((maCar) => {
                              if (maCar.status === "cancel") return false;
                              const start = dayjs(maCar.startDate).startOf(
                                "day",
                              );
                              const end = dayjs(maCar.endDate).endOf("day");
                              return current.isBetween(start, end, "day", "[]");
                            });
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
                            { required: true, message: "กรุณากรอกทะเบียน" },
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
                icon={<SaveOutlined />}
                className="h-10 px-8 rounded-lg text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-[#0683e9] flex items-center"
              >
                ยื่นคำขอ
              </Button>

              <Button
                onClick={handleAutoFill}
                icon={<ExperimentOutlined />}
                className="h-10 px-6 rounded-lg text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-amber-500 hover:bg-amber-600 text-white border-none flex items-center"
              >
                สุ่มข้อมูลตัวอย่าง
              </Button>
              
            </div>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </Card>
  );
}
