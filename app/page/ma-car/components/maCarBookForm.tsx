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

import {
  SaveOutlined,
  ExperimentOutlined,
} from "@ant-design/icons"; /* ตัวอย่างข้อมูล */

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
  const getRandomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const getRandomElement = (arr: any[]) =>
    arr[Math.floor(Math.random() * arr.length)];

  const handleAutoFill = () => {
    // A. เตรียมชุดข้อมูล
    const recipients = [
      "สาธารณสุขอำเภอวังเจ้า",
      "โรงพยาบาลตากสิน",
      "สสจ. ตาก",
      "อบต. เชียงทอง",
      "เทศบาลนครแม่สอด",
    ];
    const purposes = [
      "ประชุมวิชาการ",
      "รับผู้ป่วย",
      "รับวัคซีน",
      "ออกหน่วยแพทย์",
      "ส่งเอกสารด่วน",
      "ตรวจราชการ",
    ];
    const destinations = [
      "อ.เมือง จ.ตาก",
      "อ.แม่สอด",
      "อ.สามเงา",
      "ศาลากลาง",
      "กทม.",
      "เชียงใหม่",
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

    // ✅ B. สุ่มวันที่แบบอิสระ (ไม่ยึดเดือนปัจจุบัน)
    // 1. สุ่มปี (เช่น ระหว่าง 2025 - 2026)
    const randYear = getRandomInt(2025, 2026);
    // 2. สุ่มเดือน (0 = ม.ค., 11 = ธ.ค.)
    const randMonth = getRandomInt(0, 11);
    // 3. สุ่มวันที่ (เอาแค่ 1-28 เพื่อความปลอดภัย ไม่ต้องเช็ค Leap Year)
    const randDay = getRandomInt(1, 28);
    // 4. สุ่มเวลา
    const randHour = getRandomInt(8, 16);
    const randMinute = getRandomElement([0, 30]);

    // สร้าง Object วันที่เริ่ม
    const randStartDate = dayjs()
      .year(randYear)
      .month(randMonth)
      .date(randDay)
      .hour(randHour)
      .minute(randMinute)
      .second(0);

    // วันที่สิ้นสุด (ห่างจากวันเริ่ม 0-3 วัน)
    const duration = getRandomInt(0, 3);
    const randEndDate = randStartDate
      .add(duration, "day")
      .hour(17) // กลับถึงประมาณ 5 โมงเย็น
      .minute(0);

    // C. สุ่มผู้โดยสาร
    const validUsers = dataUser || [];
    const randPassengerCount = getRandomInt(1, Math.min(5, validUsers.length));
    const shuffledUsers = [...validUsers].sort(() => 0.5 - Math.random());
    const selectedPassengerIds = shuffledUsers
      .slice(0, randPassengerCount)
      .map((u) => u.userId);

    // D. สุ่มรถ
    let randCarId = undefined;
    if (cars && cars.length > 0) {
      randCarId = getRandomElement(cars).id;
    }

    // E. Set ค่าเข้าฟอร์ม
    form.setFieldsValue({
      typeName: [getRandomElement(typeOptions), getRandomElement(planOptions)],
      carId: randCarId,
      recipient: getRandomElement(recipients),
      purpose: getRandomElement(purposes),
      destination: getRandomElement(destinations),
      dateStart: randStartDate,
      dateEnd: randEndDate,
      driver: Math.random() > 0.5 ? "yes" : "no",
      budget: getRandomElement(budgets),
      passengers: randPassengerCount,
      passengerNames: selectedPassengerIds,
      note:
        Math.random() > 0.7
          ? `ทดสอบระบบ (Gen: ${randDay}/${randMonth + 1})`
          : "",
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

          <Form.Item style={{ marginTop: 24 }}>
            <div className="flex justify-center items-center gap-3">
              <Button
                type="primary"
                htmlType="submit"
                // loading={submitting}
                icon={<SaveOutlined />}
                className="h-10 px-8 rounded-lg text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-[#0683e9] flex items-center border-none"
              >
                จองรถ
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
};

export default MaCarBookForm;
