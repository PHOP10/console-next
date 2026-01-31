"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  message,
  Button,
  ConfigProvider,
  Divider,
  InputNumber,
  Row,
  Col,
} from "antd";
import { MaCarType } from "../../common";
import { maCarService } from "../services/maCar.service";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import th_TH from "antd/locale/th_TH";
import { DashboardOutlined } from "@ant-design/icons";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.extend(buddhistEra);
dayjs.locale("th");

interface MaCarReturnProps {
  open: boolean;
  onClose: () => void;
  record: MaCarType | null;
  fetchData: () => void;
  mode?: "user_return" | "admin_ack";
}

const MaCarReturn: React.FC<MaCarReturnProps> = ({
  open,
  onClose,
  record,
  fetchData,
  mode = "user_return",
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);
  const isAdmin = mode === "admin_ack";

  const handleAction = async (values: {
    returnNote: string;
    returnMileage: number;
  }) => {
    if (!record) return;
    setLoading(true);
    try {
      const payload = isAdmin
        ? { id: record.id, status: "success" }
        : {
            id: record.id,
            returnAt: new Date().toISOString(),
            returnByName: session?.user?.fullName,
            returnNote: values.returnNote,
            returnMileage: values.returnMileage
              ? Number(values.returnMileage)
              : 0,
            status: "return",
          };
      await intraAuthService.updateMaCar(payload);
      if (!isAdmin && values.returnMileage && record.carId) {
        await intraAuthService.updateMasterCar({
          id: record.carId,
          mileage: Number(values.returnMileage),
        });
      }
      message.success(
        isAdmin ? "ยืนยันการรับรถคืนสำเร็จ" : "บันทึกการคืนรถเรียบร้อยแล้ว",
      );

      fetchData();
      onClose();
      form.resetFields();
    } catch (error) {
      message.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && record) {
      const isTouched = form.isFieldsTouched(["returnMileage"]);
      if (!isTouched) {
        const currentMileage =
          record.startMileage || record.masterCar?.mileage || 0;
        form.setFieldsValue({
          returnMileage: currentMileage,
        });
      }
    }
  }, [open, record, form]);

  return (
    <Modal
      title={
        <div
          className={`text-xl font-bold text-center w-full ${isAdmin ? "text-purple-600" : "text-[#0683e9]"}`}
        >
          {isAdmin ? "ตรวจสอบและรับรถคืน" : "บันทึกการคืนรถ"}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      styles={{ content: { borderRadius: "20px" } }}
    >
      <ConfigProvider locale={th_TH}>
        {record && (
          <div className="flex flex-col gap-4">
            {/* ✅ ส่วนรายละเอียด พร้อมแถบสีทางซ้าย */}
            <div
              className={`relative overflow-hidden p-5 rounded-2xl border shadow-sm ${
                isAdmin
                  ? "bg-purple-50/50 border-purple-100"
                  : "bg-blue-50/50 border-blue-100"
              }`}
            >
              {/* แถบสีด้านซ้าย */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  isAdmin ? "bg-purple-500" : "bg-blue-500"
                }`}
              ></div>

              {/* รายละเอียดรถ */}
              <div className="pl-2">
                <div className="flex items-start gap-3 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">รถที่ใช้</div>
                    <div className="font-semibold text-gray-800 text-base">
                      {record.masterCar?.carName} (
                      {record.masterCar?.licensePlate})
                    </div>
                  </div>
                </div>

                {/* แสดงเลขไมล์เริ่มต้น */}
                <div className="flex items-center gap-2 mb-3 bg-white/60 p-2 rounded-lg border border-gray-100 w-fit">
                  <DashboardOutlined className="text-gray-400" />
                  <div>
                    <span className="text-xs text-gray-500 mr-2">
                      เลขไมล์ก่อนเดินทาง:
                    </span>
                    <span className="font-mono font-semibold text-gray-700">
                      {/* แก้ไขเงื่อนไขตรงนี้ */}
                      {record.startMileage !== null &&
                      record.startMileage !== undefined
                        ? record.startMileage.toLocaleString()
                        : "-"}{" "}
                      กม.
                    </span>
                  </div>
                </div>

                <Row gutter={[0, 12]} className="mb-3">
                  {/* วัตถุประสงค์ - เต็มความกว้าง */}
                  <Col span={24}>
                    <div className="text-xs text-gray-500">วัตถุประสงค์</div>
                    <div className="font-medium text-gray-700 break-words whitespace-pre-wrap">
                      {record.purpose || "-"}
                    </div>
                  </Col>

                  {/* จุดหมาย - เต็มความกว้าง */}
                  <Col span={24}>
                    <div className="text-xs text-gray-500">จุดหมาย</div>
                    <div className="font-medium text-gray-700 break-words whitespace-pre-wrap">
                      {record.destination}
                    </div>
                  </Col>
                </Row>
                {/* วันเวลา */}
                <div className="flex items-start gap-3">
                  <div>
                    <div className="text-xs text-gray-500">
                      ช่วงเวลาการใช้รถ
                    </div>
                    <div className="font-medium text-gray-700">
                      {record.dateStart
                        ? `${dayjs(record.dateStart).add(543, "year").format("DD/MMMM/BBBB HH:mm")} น.`
                        : "-"}
                      {" - "}
                      {record.dateEnd
                        ? `${dayjs(record.dateEnd).add(543, "year").format("DD/MMMM/BBBB HH:mm")} น.`
                        : "-"}
                    </div>
                  </div>
                </div>

                {/* ส่วนแสดงข้อมูลคืนรถ (สำหรับแอดมิน) */}
                {isAdmin && record.returnAt && (
                  <div className="mt-4 p-3 bg-white rounded-xl border border-purple-200 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs text-purple-600 font-bold">
                        ข้อมูลการคืนรถ
                      </div>
                      {record.returnMileage && (
                        <div className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-mono">
                          เลขไมล์ตอนคืนรถ:{" "}
                          {record.returnMileage.toLocaleString()} กม.
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-gray-700 italic border-l-2 border-purple-300 pl-2 my-2">
                      "{record.returnNote || "ไม่มีหมายเหตุ"}"
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2 text-right">
                      คืนโดย: {record.returnByName} เมื่อ{" "}
                      {dayjs(record.returnAt)
                        .add(543, "year")
                        .format("DD/MM/BBBB HH:mm")}{" "}
                      น.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Divider style={{ margin: "8px 0" }} />

            <Form form={form} layout="vertical" onFinish={handleAction}>
              {!isAdmin && (
                <>
                  {/* ✅ เพิ่มช่องกรอกเลขไมล์ */}
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="returnMileage"
                        label={
                          <span className="font-semibold text-gray-700">
                            เลขไมล์เมื่อคืนรถ (กม.)
                          </span>
                        }
                        // ✅ เพิ่มข้อความแสดงเลขไมล์เริ่มต้นด้านล่าง เพื่อช่วยเตือนความจำ
                        extra={
                          <div className="text-xs text-gray-500 mt-1">
                            * เลขไมล์เริ่มต้น:{" "}
                            <span className="font-mono">
                              {record?.startMileage?.toLocaleString() || 0}
                            </span>{" "}
                            กม.
                          </div>
                        }
                        rules={[
                          { required: true, message: "กรุณาระบุเลขไมล์" },
                          // ✅ เพิ่ม validation ห้ามกรอกน้อยกว่าเลขเดิม
                          {
                            validator: (_, value) => {
                              const start = record?.startMileage || 0;
                              if (value && value < start) {
                                return Promise.reject(
                                  new Error("เลขไมล์ต้องมากกว่าเลขเริ่มต้น"),
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder="เลขไมล์ปัจจุบัน"
                          className="rounded-xl h-10 pt-1"
                          // ✅ กำหนดค่าต่ำสุดเท่ากับเลขไมล์เริ่มต้น
                          min={record?.startMileage || 0}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value: any) =>
                            value?.replace(
                              /\$\s?|(,*)/g,
                              "",
                            ) as unknown as number
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="returnNote"
                    label={
                      <span className="font-semibold text-gray-700">
                        หมายเหตุการคืน / สภาพรถ
                      </span>
                    }
                    rules={[
                      {
                        message: "กรุณากรอกรายละเอียดการคืนรถ",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={3}
                      className="rounded-xl border-gray-300"
                      placeholder="ระบุความผิดปกติ, ระดับน้ำมันคงเหลือ หรือสภาพรถ..."
                    />
                  </Form.Item>
                </>
              )}

              <div className="flex justify-end gap-3">
                <Button onClick={onClose} className="rounded-lg h-10 px-6">
                  ยกเลิก
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className={`rounded-lg h-10 px-6 border-0 ${
                    isAdmin
                      ? "bg-purple-600 hover:bg-purple-500"
                      : "bg-[#0683e9] hover:bg-blue-600"
                  }`}
                >
                  {isAdmin ? "ยืนยันรับรถคืน" : "ยืนยันการคืนรถ"}
                </Button>
              </div>
            </Form>
          </div>
        )}
      </ConfigProvider>
    </Modal>
  );
};

export default MaCarReturn;
