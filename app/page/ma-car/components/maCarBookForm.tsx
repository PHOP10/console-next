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
      const { carId, dateStart, dateEnd } = values;
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

      const payload = {
        ...values,
        status: "pending",
        createdName: session?.user?.fullName,
        createdById: session?.user?.userId,
        dateStart: dayjs(dateStart).toISOString(),
        dateEnd: dayjs(dateEnd).toISOString(),
      };

      await intraAuthService.createMaCar(payload);
      message.success("จองรถสำเร็จ");
      form.resetFields();

      if (typeof fetchData === "function") {
        await fetchData();
      }

      setTimeout(() => {
        router.push("/page/ma-car/maCar");
      }, 1000);
    } catch (err) {
      console.error("Booking Error:", err);
      message.error("เกิดข้อผิดพลาดจากระบบ ไม่สามารถดำเนินการได้");
    }
  };

  // --- Style Constants (Master Template) ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  // Checkbox & Radio Style (Optional: ทำให้ดู Modern ขึ้น)
  const optionGroupStyle = "bg-gray-50 p-4 rounded-xl border border-gray-200";

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
    <Card
      className="shadow-lg rounded-2xl border-gray-100 overflow-hidden"
      title={
        <div className="text-xl font-bold text-[#0683e9] text-center py-2">
          ฟอร์มจองรถ
        </div>
      }
    >
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
              label="ประเภทการเดินทางและแผนงาน"
              rules={[
                { required: true, message: "กรุณาเลือกอย่างน้อย 1 รายการ" },
              ]}
            >
              <div className={optionGroupStyle}>
                <Checkbox.Group style={{ width: "100%" }}>
                  <Row gutter={[16, 16]}>
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
              </div>
            </Form.Item>
          </div>

          {/* Section 2: ข้อมูลรถและการใช้งาน */}
          <Row gutter={24}>
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
                name="purpose"
                label="วัตถุประสงค์"
                rules={[{ required: true, message: "กรุณากรอกวัตถุประสงค์" }]}
              >
                <Input.TextArea
                  placeholder="กรอกวัตถุประสงค์"
                  rows={1} // เริ่มต้น 1 บรรทัด จะขยายเอง
                  className={textAreaStyle}
                  style={{ minHeight: "44px" }}
                />
              </Form.Item>
            </Col>
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
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Section 3: วันเวลา */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="dateStart"
                label="ตั้งแต่วันที่"
                rules={[{ required: true, message: "กรุณาเลือกวันเวลาเริ่ม" }]}
              >
                <DatePicker
                  showTime={{ format: "HH:mm" }}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY HH:mm"
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
                shouldUpdate={(prev, cur) => prev.dateStart !== cur.dateStart}
              >
                {({ getFieldValue }) => {
                  const dateStart = getFieldValue("dateStart");
                  return (
                    <Form.Item
                      name="dateEnd"
                      label="ถึงวันที่"
                      rules={[
                        { required: true, message: "กรุณาเลือกวันเวลาสิ้นสุด" },
                      ]}
                    >
                      <DatePicker
                        showTime={{ format: "HH:mm" }}
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY HH:mm"
                        placeholder="เลือกวันเวลาสิ้นสุด"
                        className={`${inputStyle} pt-2`}
                        disabled={!dateStart}
                        disabledDate={(current) => {
                          const today = dayjs().startOf("day");
                          const startDay = dateStart
                            ? dayjs(dateStart).startOf("day")
                            : today;
                          return (
                            current && (current < today || current < startDay)
                          );
                        }}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>

          {/* Section 4: ข้อมูลเพิ่มเติม */}
          <Row gutter={24}>
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
                rules={[{ required: true, message: "กรุณากรอกจำนวน" }]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: "100%" }}
                  placeholder="ระบุจำนวน"
                  className={`${inputStyle} pt-1`}
                  onKeyDown={(e) => {
                    if (
                      !/[0-9]/.test(e.key) &&
                      ![
                        "Backspace",
                        "Delete",
                        "Tab",
                        "ArrowLeft",
                        "ArrowRight",
                      ].includes(e.key)
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
                  className={selectStyle} // ใช้ Class เดิมแต่ Antd จะจัดการ multiple ให้เอง
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
