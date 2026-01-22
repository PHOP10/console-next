"use client";

import React from "react";
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
  Space,
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
import TextArea from "antd/es/input/TextArea";
dayjs.locale("th");
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore); // ลงทะเบียน plugin
dayjs.extend(isSameOrAfter); // ลงทะเบียน plugin

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
  const selectedCarId = form.getFieldValue("carId");
  const router = useRouter();

  console.log("user:", session?.user?.userId);
  console.log("maCarUser:", maCarUser);

  const onFinish = async (values: any) => {
    // เริ่ม Loading (ถ้าคุณมี state นี้)
    // setSubmitting(true);

    try {
      const { carId, dateStart, dateEnd } = values;
      const currentUserId = session?.user?.userId;

      // ตรวจสอบการจองซ้ำ
      const isOverlaps =
        maCar &&
        maCar.some((booking) => {
          const isNotCancel = booking.status !== "cancel";

          // ตรวจสอบช่วงเวลาที่ทับซ้อนกัน (เช็คละเอียดระดับนาที)
          const isTimeOverlap =
            dayjs(dateStart).isBefore(dayjs(booking.dateEnd)) &&
            dayjs(dateEnd).isAfter(dayjs(booking.dateStart));

          // เงื่อนไขที่ 1: รถคันนี้ถูกจองไปแล้วในช่วงเวลานั้น
          const isSameCarOverlap = booking.carId === carId;

          // เงื่อนไขที่ 2: ผู้ใช้งานคนนี้ (ตัวเอง) มีรายการจองอื่นอยู่แล้วในช่วงเวลานั้น
          const isUserOverlap = booking.createdById === currentUserId;
          return (
            isNotCancel && isTimeOverlap && (isSameCarOverlap || isUserOverlap)
          );
        });

      if (isOverlaps) {
        // เช็คว่าซ้ำเพราะอะไรเพื่อแจ้งเตือนให้ถูกต้อง
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

      // 2. เตรียม Payload
      const payload = {
        ...values,
        status: "pending",
        createdName: session?.user?.fullName,
        createdById: session?.user?.userId,
        dateStart: dayjs(dateStart).toISOString(),
        dateEnd: dayjs(dateEnd).toISOString(),
      };

      // 3. เรียก API
      await intraAuthService.createMaCar(payload);

      // 4. สำเร็จ
      message.success("จองรถสำเร็จ");
      form.resetFields();

      // ดึงข้อมูลใหม่เพื่อให้ maCarUser ตัวล่าสุดมาใช้ในการเช็คครั้งต่อไป
      if (typeof fetchData === "function") {
        await fetchData();
      }

      setTimeout(() => {
        router.push("/page/ma-car/maCar"); // เปลี่ยนเป็น Path ของหน้าที่คุณต้องการให้ไป
      }, 1000);
    } catch (err) {
      console.error("Booking Error:", err);
      message.error("เกิดข้อผิดพลาดจากระบบ ไม่สามารถดำเนินการได้");
    } finally {
      // ไม่ว่าจะสำเร็จหรือ error ให้ปลดล็อก loading ตรงนี้
      // setSubmitting(false);
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

  /*  ----------------------------------------- ข้อมูลตัวอย่าง/------------------------------------------ */
  // --- Helper Functions สำหรับการสุ่ม (แก้ไข Type แล้ว) ---
  const getRandomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const getRandomElement = (arr: any[]) =>
    arr[Math.floor(Math.random() * arr.length)];

  // ✅ ฟังก์ชันสุ่มข้อมูลใส่ฟอร์ม (Random Auto-fill)
  const handleAutoFill = () => {
    // 1. เตรียมชุดข้อมูลตัวอย่าง
    const recipients = [
      "สาธารณสุขอำเภอวังเจ้า",
      "โรงพยาบาลตากสิน",
      "สสจ. ตาก",
      "อบต. เชียงทอง",
    ];
    const purposes = [
      "เข้าร่วมประชุมวิชาการประจำปี",
      "รับส่งผู้ป่วยส่งต่อ",
      "รับวัคซีนและเวชภัณฑ์",
      "ออกหน่วยแพทย์เคลื่อนที่",
      "ติดต่อประสานงานโครงการส่งเสริมสุขภาพ",
    ];
    const destinations = [
      "อ.เมือง จ.ตาก",
      "อ.แม่สอด จ.ตาก",
      "ศาลากลางจังหวัด",
      "ศูนย์ราชการ",
    ];
    const budgets = [
      "งบกลาง",
      "งบโครงการ",
      "งบผู้จัด",
      "เงินบำรุง",
      "ไม่ขอเบิก",
    ];
    const typeOptions = ["ในจังหวัด", "นอกจังหวัด"];
    const planOptions = ["แผนปกติ", "แผนด่วน"];

    // 2. สุ่มวันที่ (เริ่มอีก 1-7 วันข้างหน้า, ระยะเวลา 1-3 วัน)
    const startOffset = getRandomInt(1, 7);
    const duration = getRandomInt(1, 3);
    // เซ็ตเวลาให้ดูสมจริง (เช่น เริ่ม 08:30)
    const randStartDate = dayjs()
      .add(startOffset, "day")
      .hour(8)
      .minute(30)
      .second(0);
    const randEndDate = randStartDate
      .add(duration, "day")
      .hour(16)
      .minute(30)
      .second(0);

    // 3. สุ่มผู้โดยสาร (1-5 คน)
    const randPassengers = getRandomInt(1, 5);
    // สุ่มรายชื่อคน (Shuffle array แล้วตัดมาตามจำนวน)
    // ตรวจสอบว่ามี dataUser หรือไม่ เพื่อป้องกัน error
    const validUsers = dataUser || [];
    const shuffledUsers = [...validUsers].sort(() => 0.5 - Math.random());
    const randPassengerNames = shuffledUsers
      .slice(0, randPassengers)
      .map((u) => u.userId);

    // 4. สุ่มรถ (ถ้ามีข้อมูลรถ)
    let randCarId = undefined;
    if (cars && cars.length > 0) {
      randCarId = getRandomElement(cars).id;
    }

    // ✅ Set ค่าเข้าฟอร์ม
    form.setFieldsValue({
      typeName: [getRandomElement(typeOptions), getRandomElement(planOptions)], // สุ่มเลือก Checkbox อย่างละ 1
      carId: randCarId,
      recipient: getRandomElement(recipients),
      purpose: getRandomElement(purposes),
      destination: getRandomElement(destinations),
      dateStart: randStartDate,
      dateEnd: randEndDate,
      driver: Math.random() > 0.5 ? "yes" : "no", // สุ่ม Yes/No
      budget: getRandomElement(budgets),
      passengers: randPassengers,
      passengerNames: randPassengerNames,
      note: Math.random() > 0.7 ? "ทดสอบระบบ Auto-fill" : "", // สุ่มใส่หมายเหตุบ้าง
    });
  };

  return (
    <Card>
      <ConfigProvider locale={th_TH}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            requesterName: session?.user?.fullName,
          }}
        >
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
                <Select placeholder="เลือกรถ" loading={loading}>
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
                  placeholder="กรอกเรียน"
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
                  showTime={{ format: "HH:mm" }}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY HH:mm"
                  onChange={() => form.setFieldValue("dateEnd", null)}
                  // 1. ป้องกันการเลือก "วันที่" ย้อนหลัง
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf("day");
                  }}
                  // 2. ป้องกันการเลือก "เวลา" ย้อนหลัง (เฉพาะกรณีเลือกวันปัจจุบัน)
                  disabledTime={(current) => {
                    if (current && current.isSame(dayjs(), "day")) {
                      return {
                        disabledHours: () =>
                          Array.from({ length: dayjs().hour() }, (_, i) => i),
                        disabledMinutes: (selectedHour) => {
                          if (selectedHour === dayjs().hour()) {
                            return Array.from(
                              { length: dayjs().minute() },
                              (_, i) => i,
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
                        format="DD/MM/YYYY HH:mm"
                        disabled={!dateStart}
                        // ป้องกันวันที่ย้อนหลัง และห้ามเลือกก่อนวันเริ่ม (dateStart)
                        disabledDate={(current) => {
                          const today = dayjs().startOf("day");
                          const startDay = dateStart
                            ? dayjs(dateStart).startOf("day")
                            : today;
                          return (
                            current && (current < today || current < startDay)
                          );
                        }}
                        // ป้องกันเวลาสิ้นสุดย้อนหลัง (ถ้าเลือกวันเดียวกับวันเริ่ม ห้ามเลือกเวลาที่น้อยกว่าวันเริ่ม)
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
                                    (_, i) => i,
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
                      value === "other" ? "" : value,
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
                  {/* <Select.Option value="other">อื่นๆ...</Select.Option> */}
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
                  max={10}
                  style={{ width: "100%" }}
                  placeholder="กรอกจำนวนผู้โดยสาร"
                  // ดักจับการกดปุ่ม (Keyboard Event)
                  onKeyDown={(e) => {
                    // อนุญาตให้กดได้แค่ ตัวเลข, Backspace, Delete, Tab, และลูกศร
                    if (
                      !/[0-9]/.test(e.key) &&
                      e.key !== "Backspace" &&
                      e.key !== "Delete" &&
                      e.key !== "Tab" &&
                      e.key !== "ArrowLeft" &&
                      e.key !== "ArrowRight"
                    ) {
                      e.preventDefault();
                    }
                  }}
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
                  loading={loading}
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

          {/* ✅ แก้ไขส่วนปุ่มกด: ใช้ Space เพื่อจัดเรียงปุ่ม */}
          <Form.Item style={{ textAlign: "center", marginTop: "20px" }}>
            <Space size="large" wrap>
              {/* ปุ่มจองรถ (Submit) */}
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  minWidth: "150px",
                  height: "50px",
                  fontSize: "16px",
                }}
              >
                จองรถ
              </Button>

              {/* ✅ ปุ่มสุ่มข้อมูลตัวอย่าง (เพิ่มใหม่) */}
              <Button
                htmlType="button" // สำคัญ! ต้องใส่เป็น button เพื่อกันไม่ให้ Submit form
                onClick={handleAutoFill}
                size="large"
                style={{
                  minWidth: "150px",
                  height: "50px",
                  fontSize: "16px",
                }}
              >
                สุ่มข้อมูลตัวอย่าง
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </Card>
  );
};

export default MaCarBookForm;
