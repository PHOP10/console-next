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
import CustomTable from "../../common/CustomTable";
import { useRouter } from "next/navigation";
import { buddhistLocale } from "@/app/common";
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
  const router = useRouter();

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
    {
      title: "ลามาแล้ว (วัน)",
      dataIndex: "usedDays",
      key: "usedDays",
      align: "center" as const,
    },
    {
      title: "ลาครั้งนี้ (วัน)",
      dataIndex: "currentDays",
      key: "currentDays",
      align: "center" as const,
    },
    {
      title: "รวมการลา (วัน)",
      dataIndex: "totalDays",
      key: "totalDays",
      align: "center" as const,
      render: (val: number, record: any) => {
        const limits: Record<number, number> = {
          1: 60,
          2: 45,
          3: 90,
        };

        const limit = limits[record.key];
        const isOverLimit = limit && val > limit;

        return (
          <span className={isOverLimit ? "text-red-500 font-bold" : ""}>
            {val}
          </span>
        );
      },
    },
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
      router.push("/page/data-leave/dataLeave?tab=2");
    } catch (err: any) {
      console.error("Error in onFinish:", err);
      message.error(err.message || "ไม่สามารถบันทึกใบลาได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row gutter={[24, 24]}>
      {/* ฟอร์ม */}
      <Col xs={24} md={12}>
        <Card
          className="shadow-lg rounded-2xl border-gray-100 overflow-hidden h-full"
          title={
            <div className="text-xl font-bold text-[#0683e9] text-center py-2">
              แบบฟอร์มใบลา
            </div>
          }
        >
          <ConfigProvider locale={th_TH}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              {/* สไตล์กลางสำหรับ Input ทั้งหมด */}
              {(() => {
                const inputStyle =
                  "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";
                const selectStyle =
                  "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";
                const textAreaStyle =
                  "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

                return (
                  <>
                    <Form.Item
                      label="เขียนที่"
                      name="writeAt"
                      rules={[
                        { required: true, message: "กรุณากรอกเขียนที่..." },
                      ]}
                    >
                      <Select
                        placeholder="เขียนที่"
                        className={selectStyle}
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
                                className="rounded-lg border-gray-300"
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
                      rules={[
                        { required: true, message: "กรุณาเลือกประเภทลา" },
                      ]}
                    >
                      <Select
                        placeholder="เลือกประเภทลา"
                        className={selectStyle}
                      >
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
                      rules={[
                        { required: true, message: "กรุณากรอกเหตุผลการลา" },
                      ]}
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="กรอกเหตุผลการลา"
                        maxLength={50}
                        className={textAreaStyle}
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="ตั้งแต่วันที่"
                          name="dateStart"
                          rules={[
                            {
                              required: true,
                              message: "กรุณาเลือกวันที่เริ่มลา",
                            },
                          ]}
                        >
                          <DatePicker
                            locale={buddhistLocale}
                            format="D MMMM BBBB"
                            style={{ width: "100%" }}
                            placeholder="เลือกวันที่"
                            className={`${inputStyle} pt-2`}
                            onChange={() => {
                              form.setFieldValue("dateEnd", null);
                            }}
                            disabledDate={(current) => {
                              if (!current) return false;
                              if (current < dayjs().startOf("day")) return true;
                              return leaveByUserId.some((leave) => {
                                const start = dayjs(leave.dateStart).startOf(
                                  "day",
                                );
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
                              message: "กรุณาเลือกวันที่สิ้นสุด",
                            },
                          ]}
                        >
                          <DatePicker
                            locale={buddhistLocale}
                            format="D MMMM BBBB"
                            style={{ width: "100%" }}
                            className={`${inputStyle} pt-2`}
                            placeholder={
                              selectedDateStart
                                ? "เลือกวันที่"
                                : "เลือกวันเริ่มก่อน"
                            }
                            disabled={!selectedDateStart}
                            disabledDate={(current) => {
                              if (!current) return false;
                              if (
                                selectedDateStart &&
                                current <
                                  dayjs(selectedDateStart).startOf("day")
                              ) {
                                return true;
                              }
                              if (current < dayjs().startOf("day")) return true;
                              return leaveByUserId.some((leave) => {
                                const start = dayjs(leave.dateStart).startOf(
                                  "day",
                                );
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
                      <Input.TextArea
                        rows={2}
                        placeholder="กรอกที่อยู่ระหว่างลา"
                        className={textAreaStyle}
                      />
                    </Form.Item>

                    <Form.Item
                      label="เบอร์ติดต่อระหว่างลา"
                      name="contactPhone"
                      rules={[
                        { required: true, message: "กรุณากรอก เบอร์โทรศัพท์" },
                      ]}
                    >
                      <Input
                        placeholder="กรอกเบอร์โทรศัพท์"
                        maxLength={10}
                        className={inputStyle}
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
                          message: "กรุณาเลือกผู้รับผิดชอบงาน",
                        },
                      ]}
                    >
                      <Select
                        placeholder="เลือกผู้รับผิดชอบงาน"
                        className={selectStyle}
                      >
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
                      getValueFromEvent={(e) =>
                        Array.isArray(e) ? e : e?.fileList
                      }
                    >
                      <Upload
                        name="file"
                        maxCount={1}
                        fileList={fileList}
                        beforeUpload={() => false}
                        onChange={handleUploadChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                      >
                        <Button
                          icon={<UploadOutlined />}
                          className="h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 hover:text-blue-500"
                        >
                          เลือกไฟล์
                        </Button>
                      </Upload>
                    </Form.Item>

                    <Form.Item label="หมายเหตุเพิ่มเติม" name="details">
                      <Input.TextArea
                        rows={3}
                        placeholder="หมายเหตุเพิ่มเติม"
                        className={textAreaStyle}
                      />
                    </Form.Item>

                    <Form.Item
                      style={{
                        marginTop: 24,
                        marginBottom: 8,
                      }}
                    >
                      <div className="flex justify-center items-center gap-3">
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="h-10 px-8 rounded-lg text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-[#0683e9] border-0 flex items-center"
                        >
                          ส่งใบลา
                        </Button>
                      </div>
                    </Form.Item>
                  </>
                );
              })()}
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
              สรุปการลาของผู้ใช้
            </div>
          }
        >
          <CustomTable
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
