"use client";

import React, { useMemo } from "react";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Table,
  Upload,
} from "antd";
import isBetween from "dayjs/plugin/isBetween";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import { useSession } from "next-auth/react";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import th_TH from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { DataLeaveService } from "../services/dataLeave.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
dayjs.locale("th");

interface LeaveBookingFormProps {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  masterLeaves: MasterLeaveType[];
  leaveByUserId?: DataLeaveType[];
  user: UserType[];
  fetchData: () => Promise<void>;
}

export default function LeaveBookingForm({
  loading,
  setLoading,
  // createDataLeave,
  masterLeaves,
  leaveByUserId = [],
  user,
  fetchData,
}: LeaveBookingFormProps) {
  const [form] = Form.useForm();
  const { data: session } = useSession();
  const { TextArea } = Input;
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  const intraAuth = useAxiosAuth();
  const intraAuthService = DataLeaveService(intraAuth);

  const handleUploadChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
  };

  // ฟังก์ชันคำนวณจำนวนวันลา
  const calculateDays = (start: string | Date, end: string | Date) => {
    if (!start || !end) return 0;
    return dayjs(end).endOf("day").diff(dayjs(start).startOf("day"), "day") + 1;
  };

  // ดึงค่าที่เลือกในฟอร์ม
  const selectedTypeId = Form.useWatch("typeId", form);
  const selectedDateStart = Form.useWatch("dateStart", form);
  const selectedDateEnd = Form.useWatch("dateEnd", form);
  dayjs.extend(isBetween);

  // // ✅ คำนวณข้อมูลตาราง
  // const tableData = useMemo(() => {
  //   return masterLeaves.map((leave) => {
  //     // ลามาแล้ว
  //     const usedDays = leaveByUserId
  //       .filter((item) => item.typeId === leave.id && item.status === "approve")
  //       .reduce(
  //         (sum, item) => sum + calculateDays(item.dateStart, item.dateEnd),
  //         0
  //       );

  //     const currentDays =
  //       selectedTypeId === leave.id && selectedDateStart && selectedDateEnd
  //         ? calculateDays(selectedDateStart, selectedDateEnd)
  //         : 0;

  //     const totalDays = usedDays + currentDays;

  //     return {
  //       key: leave.id,
  //       leaveType: leave.leaveType,
  //       usedDays,
  //       currentDays,
  //       totalDays,
  //     };
  //   });
  // }, [
  //   masterLeaves,
  //   leaveByUserId,
  //   selectedTypeId,
  //   selectedDateStart,
  //   selectedDateEnd,
  // ]);

  // ✅ เพิ่มฟังก์ชันคำนวณปีงบประมาณ (1 ตุลาคม - 30 กันยายน)
  const getCurrentFiscalYear = () => {
    const today = dayjs();
    const currentYear = today.year();
    const fiscalYearStart = dayjs(`${currentYear}-10-01`);

    // ถ้าวันนี้ก่อน 1 ตุลาคม ให้ใช้ปีงบประมาณปีก่อน
    if (today.isBefore(fiscalYearStart)) {
      return {
        start: dayjs(`${currentYear - 1}-10-01`).startOf("day"),
        end: dayjs(`${currentYear}-09-30`).endOf("day"),
      };
    }

    // ถ้าวันนี้หลัง 1 ตุลาคม ให้ใช้ปีงบประมาณปีปัจจุบัน
    return {
      start: fiscalYearStart.startOf("day"),
      end: dayjs(`${currentYear + 1}-09-30`).endOf("day"),
    };
  };

  // ✅ แก้ไขส่วน tableData ให้กรองเฉพาะการลาในปีงบประมาณปัจจุบัน
  const tableData = useMemo(() => {
    const fiscalYear = getCurrentFiscalYear();

    return masterLeaves.map((leave) => {
      // ลามาแล้ว - กรองเฉพาะการลาที่อยู่ในปีงบประมาณปัจจุบัน
      const usedDays = leaveByUserId
        .filter((item) => {
          if (item.typeId !== leave.id || item.status !== "approve") {
            return false;
          }

          // ตรวจสอบว่าวันเริ่มลาอยู่ในปีงบประมาณปัจจุบันหรือไม่
          const leaveStartDate = dayjs(item.dateStart);
          return leaveStartDate.isBetween(
            fiscalYear.start,
            fiscalYear.end,
            "day",
            "[]",
          );
        })
        .reduce(
          (sum, item) => sum + calculateDays(item.dateStart, item.dateEnd),
          0,
        );

      const currentDays =
        selectedTypeId === leave.id && selectedDateStart && selectedDateEnd
          ? calculateDays(selectedDateStart, selectedDateEnd)
          : 0;

      const totalDays = usedDays + currentDays;

      return {
        key: leave.id,
        leaveType: leave.leaveType,
        usedDays,
        currentDays,
        totalDays,
      };
    });
  }, [
    masterLeaves,
    leaveByUserId,
    selectedTypeId,
    selectedDateStart,
    selectedDateEnd,
  ]);

  const columns = [
    { title: "ประเภทการลา", dataIndex: "leaveType", key: "leaveType" },
    { title: "ลามาแล้ว (วัน)", dataIndex: "usedDays", key: "usedDays" },
    { title: "ลาครั้งนี้ (วัน)", dataIndex: "currentDays", key: "currentDays" },
    { title: "รวมการลา (วัน)", dataIndex: "totalDays", key: "totalDays" },
  ];

  const uploadFile = async (file: File) => {
    if (!file) return null;

    try {
      const data = await intraAuthService.uploadDataLeaveFile(file);

      return data.fileName;
    } catch (err) {
      console.error("Upload error:", err);
      message.error("ไม่สามารถอัพโหลดไฟล์ได้");
      throw err;
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      let uploadedFileName = null;
      if (values.fileName && values.fileName.length > 0) {
        const file = values.fileName[0].originFileObj;
        if (file) {
          uploadedFileName = await uploadFile(file);
        }
      }

      // 2️⃣ เตรียม payload
      const payload = {
        typeId: Number(values.typeId),
        reason: values.reason,
        writeAt: values.writeAt,
        dateStart: values.dateStart
          ? dayjs(values.dateStart).startOf("day").toISOString()
          : null,
        dateEnd: values.dateEnd
          ? dayjs(values.dateEnd).endOf("day").toISOString()
          : null,
        contactAddress: values.contactAddress || null,
        contactPhone: values.contactPhone || null,
        backupUserId: values.backupUserId || null,
        details: values.details || null,
        status: "pending",
        createdById: session?.user?.userId || null,
        createdName: session?.user?.fullName || null,
        fileName: uploadedFileName,
      };

      await intraAuthService.createDataLeave(payload);
      await fetchData();

      message.success("บันทึกใบลาสำเร็จ");
      form.resetFields();
      setFileList([]);
    } catch (err: any) {
      console.error("Error in onFinish:", err);
      message.error(err.message || "ไม่สามารถบันทึกใบลาได้");
    } finally {
      setLoading(false);
    }
  };

  /*  ----------------------------------------- ข้อมูลตัวอย่าง/------------------------------------------ */
// --- Helper Functions สำหรับการสุ่ม (แก้ไข Type แล้ว) ---
  const getRandomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const getRandomElement = (arr: any[]) =>
    arr[Math.floor(Math.random() * arr.length)];

  // ✅ ฟังก์ชันสุ่มข้อมูลใส่ฟอร์ม (Auto-fill)
  const handleAutoFill = () => {
    // 1. ชุดข้อมูลตัวอย่าง
    const leaveTypes = masterLeaves.map((l) => l.id); // ดึง ID ประเภทลาทั้งหมดมาสุ่ม
    const reasons = [
      "ทำธุระส่วนตัว",
      "ไม่สบาย ปวดหัว ตัวร้อน",
      "พาญาติไปหาหมอ",
      "รถเสีย",
      "ติดต่อราชการ",
    ];
    const locations = ["รพ.สต.บ้านผาผึ้ง", "บ้านพัก", "โรงพยาบาลอำเภอ"];
    const contactAddresses = [
      "บ้านเลขที่ 123 หมู่ 1 ต.เชียงทอง",
      "หอพักแพทย์",
      "ติดต่อทางไลน์",
    ];

    // 2. สุ่มวันที่ (ลาล่วงหน้า 1-5 วัน, นาน 1-2 วัน)
    const startOffset = getRandomInt(1, 5);
    const duration = getRandomInt(1, 2);
    const randStartDate = dayjs().add(startOffset, "day");
    const randEndDate = randStartDate.add(duration, "day");

    // 3. สุ่มเบอร์โทร (สร้างเลขสุ่ม 10 หลัก)
    const randPhone =
      "08" +
      Array(8)
        .fill(0)
        .map(() => getRandomInt(0, 9))
        .join("");

    // 4. สุ่มผู้รับผิดชอบงานแทน (ถ้ามี user)
    let randBackupUserId = undefined;
    if (user && user.length > 0) {
      randBackupUserId = getRandomElement(user).userId;
    }

    // ✅ Set ค่าเข้าฟอร์ม
    form.setFieldsValue({
      writeAt: getRandomElement(locations),
      typeId: getRandomElement(leaveTypes),
      reason: getRandomElement(reasons),
      dateStart: randStartDate,
      dateEnd: randEndDate,
      contactAddress: getRandomElement(contactAddresses),
      contactPhone: randPhone,
      backupUserId: randBackupUserId,
      details: Math.random() > 0.5 ? "ทดสอบระบบ Auto-fill ใบลา" : "",
    });
  };

  return (
    <Row gutter={[24, 24]}>
      {/* ฟอร์ม */}
      <Col xs={24} md={12}>
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
              ฟอร์มใบลา
            </div>
          }
        >
          <ConfigProvider locale={th_TH}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="เขียนที่"
                name="writeAt"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกเขียนที่...",
                  },
                ]}
              >
                <Select
                  placeholder="เขียนที่"
                  onChange={(value) => {
                    form.setFieldValue(
                      "writeAt",
                      value === "other" ? "" : value,
                    );
                  }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ display: "flex", padding: 8 }}>
                        <Input
                          placeholder="กรอกอื่น ๆ..."
                          onPressEnter={(e) => {
                            form.setFieldValue(
                              "writeAt",
                              e.currentTarget.value,
                            );
                          }}
                          onBlur={(e) => {
                            form.setFieldValue(
                              "writeAt",
                              e.currentTarget.value,
                            );
                          }}
                        />
                      </div>
                    </>
                  )}
                >
                  <Select.Option value="รพ.สต.บ้านผาผึ้ง">
                    รพ.สต.บ้านผาผึ้ง
                  </Select.Option>
                  <Select.Option value="other">อื่นๆ...</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="ประเภทการลา"
                name="typeId"
                rules={[{ required: true, message: "กรุณาเลือกประเภทลา" }]}
              >
                <Select placeholder="เลือกประเภทลา">
                  {masterLeaves.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.leaveType}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="เหตุผลการลา"
                name="reason"
                rules={[{ required: true, message: "กรุณากรอกเหตุผลการลา" }]}
              >
                <TextArea
                  rows={2}
                  placeholder="กรอกเหตุผลการลา"
                  maxLength={50}
                />
              </Form.Item>

              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item
                    label="ตั้งแต่วันที่"
                    name="dateStart"
                    rules={[
                      { required: true, message: "กรุณาเลือกวันที่เริ่มลา" },
                    ]}
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      placeholder="เลือกวันที่เริ่มลา"
                      onChange={() => {
                        // ล้างค่า dateEnd เมื่อเปลี่ยน dateStart
                        form.setFieldValue("dateEnd", null);
                      }}
                      disabledDate={(current) => {
                        if (!current) return false;
                        // ห้ามเลือกวันในอดีต
                        if (current < dayjs().startOf("day")) return true;

                        // ตรวจสอบว่าทับกับการลาที่มีอยู่แล้วหรือไม่
                        return leaveByUserId.some((leave) => {
                          const start = dayjs(leave.dateStart).startOf("day");
                          const end = dayjs(leave.dateEnd).endOf("day");
                          return dayjs(current).isBetween(
                            start,
                            end,
                            "day",
                            "[]",
                          );
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="ถึงวันที่"
                    name="dateEnd"
                    rules={[
                      {
                        required: true,
                        message: "กรุณาเลือกวันที่สิ้นสุดการลา",
                      },
                    ]}
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      placeholder={
                        selectedDateStart
                          ? // ? `เลือกตั้งแต่ ${dayjs(selectedDateStart).format(
                            //     "DD/MM/YYYY"
                            //   )} เป็นต้นไป`
                            `เลือกวันที่สิ้นสุดการลา`
                          : "กรุณาเลือกวันที่เริ่มลาก่อน"
                      }
                      disabled={!selectedDateStart}
                      disabledDate={(current) => {
                        if (!current) return false;
                        if (
                          selectedDateStart &&
                          current < dayjs(selectedDateStart).startOf("day")
                        ) {
                          return true;
                        }
                        if (current < dayjs().startOf("day")) return true;
                        return leaveByUserId.some((leave) => {
                          const start = dayjs(leave.dateStart).startOf("day");
                          const end = dayjs(leave.dateEnd).endOf("day");
                          return dayjs(current).isBetween(
                            start,
                            end,
                            "day",
                            "[]",
                          );
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="ระหว่างลาติดต่อได้ที่"
                name="contactAddress"
                rules={[{ required: false }]}
              >
                <TextArea rows={2} placeholder="กรอกระหว่างลาติดต่อได้ที่" />
              </Form.Item>

              {/* เบอร์โทรศัพท์ */}
              <Form.Item
                label="เบอร์ติดต่อระหว่างลา"
                name="contactPhone"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอก เบอร์โทรศัพท์",
                  },
                ]}
              >
                <Input
                  placeholder="กรอกเบอร์โทรศัพท์"
                  maxLength={10}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label="ผู้รับผิดชอบงานระหว่างลา"
                name="backupUserId"
                rules={[
                  {
                    required: true,
                    message: "กรุณาเลือกผู้รับผิดชอบงานระหว่างลา",
                  },
                ]}
              >
                <Select placeholder="เลือกผู้รับผิดชอบงาน">
                  {user.map((user) => (
                    <Select.Option key={user.userId} value={user.userId}>
                      {user.firstName} {user.lastName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="แนบไฟล์ใบรับรองแพทย์ (ถ้ามี)"
                name="fileName"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              >
                <Upload
                  name="file"
                  maxCount={1}
                  fileList={fileList}
                  beforeUpload={() => false}
                  onChange={handleUploadChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                >
                  <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
                </Upload>
              </Form.Item>

              <Form.Item label="หมายเหตุเพิ่มเติม" name="details">
                <TextArea rows={3} placeholder="หมายเหตุเพิ่มเติม" />
              </Form.Item>

              {/* ✅ ปรับปรุงส่วนปุ่มกด */}
              <Form.Item style={{ textAlign: "center", marginTop: 20 }}>
                <Space size="large" wrap>
                  {/* ปุ่มส่งใบลา (Submit) */}
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
                    ส่งใบลา
                  </Button>

                  {/* ✅ ปุ่มสุ่มข้อมูลตัวอย่าง (เพิ่มใหม่) */}
                  <Button
                    htmlType="button" // ต้องใส่ htmlType="button" กัน Submit
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
      </Col>

      {/* ตาราง */}
      <Col xs={24} md={12}>
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
              สรุปการลา
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            bordered
            scroll={{ x: 300 }}
          />
        </Card>
      </Col>
    </Row>
  );
}
