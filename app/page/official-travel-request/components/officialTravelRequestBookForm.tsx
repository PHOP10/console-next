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
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";
import { UserType, MasterCarType } from "../../common";
import { useSession } from "next-auth/react";
import th_TH from "antd/locale/th_TH";
import dayjs from "dayjs";
import "dayjs/locale/th";
dayjs.locale("th");

interface Props {
  dataUser: UserType[];
  cars: MasterCarType[];
}

export default function OfficialTravelRequestBookForm({
  dataUser,
  cars,
}: Props) {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const service = officialTravelRequestService(intraAuth);
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        recipient: values.recipient || null,
        documentNo: values.documentNo,
        // title: values.title,
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

  return (
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
          ฟอร์มขอไปราชการ
        </div>
      }
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
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
                  <Select.Option value="other">อื่นๆ...</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="เลขที่เอกสาร"
                name="documentNo"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกเลขที่เอกสาร",
                  },
                  {
                    pattern: /^[ก-ฮA-Za-z0-9./\s]+$/,
                    message: "กรอกได้เฉพาะตัวอักษร ตัวเลข จุด และ /",
                  },
                ]}
              >
                <Input placeholder="กรอกเลขที่เอกสาร" maxLength={14} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="วัตถุประสงค์"
                name="missionDetail"
                rules={[{ required: true, message: "กรุณากรอกวัตถุประสงค์" }]}
              >
                <Input.TextArea placeholder="กรอกรายวัตถุประสงค์" rows={2} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="สถานที่"
                name="location"
                rules={[{ required: true, message: "กรุณากรอกสถานที่" }]}
              >
                <Input.TextArea placeholder="กรอกสถานที่" rows={2} />
              </Form.Item>
            </Col>
          </Row>

          {/* ✅ แสดงวันที่แบบ พ.ศ. */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="ตั้งแต่วันที่"
                name="startDate"
                rules={[
                  { required: true, message: "กรุณาเลือกวันที่เริ่มเดินทาง" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="เลือกวันที่"
                  format={(value) => formatBuddhist(value as dayjs.Dayjs)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="ถึงวันที่"
                name="endDate"
                rules={[
                  { required: true, message: "กรุณาเลือกวันที่สิ้นสุดเดินทาง" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="เลือกวันที่"
                  format={(value) => formatBuddhist(value as dayjs.Dayjs)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
            <Col span={12}>
              <Form.Item label="เลือกรถ" name="carId">
                <Select placeholder="เลือกรถ">
                  {cars.map((car) => (
                    <Select.Option key={car.id} value={car.id}>
                      {car.licensePlate} ({car.brand} {car.model})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="จำนวนผู้โดยสาร" name="passengers">
                <InputNumber
                  min={1}
                  placeholder="จำนวนผู้โดยสาร"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="รายชื่อผู้โดยสาร" name="passengerNames">
                <Select
                  mode="multiple"
                  placeholder="เลือกผู้โดยสาร"
                  optionFilterProp="children"
                >
                  {dataUser.map((user) => (
                    <Select.Option key={user.userId} value={user.userId}>
                      {user.firstName} {user.lastName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>{" "}
            </Col>
          </Row>
          <Form.Item label="หมายเหตุเพิ่มเติม" name="note">
            <Input.TextArea placeholder="หมายเหตุเพิ่มเติม" rows={3} />
          </Form.Item>

          <Form.Item style={{ textAlign: "center" }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              ยื่นคำขอ
            </Button>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </Card>
  );
}
