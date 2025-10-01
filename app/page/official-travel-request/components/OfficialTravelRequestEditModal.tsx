"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  message,
  Spin,
  ConfigProvider,
  Row,
  Col,
  Button,
} from "antd";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { officialTravelRequestService } from "../services/officialTravelRequest.service";
import {
  UserType,
  MasterCarType,
  OfficialTravelRequestType,
} from "../../common";
import th_TH from "antd/locale/th_TH";
import "dayjs/locale/th";

interface Props {
  open: boolean;
  onClose: () => void;
  record: OfficialTravelRequestType | null;
  fetchData: () => void;
  dataUser: UserType[];
  cars: MasterCarType[];
}

const OfficialTravelRequestEditModal: React.FC<Props> = ({
  open,
  onClose,
  record,
  fetchData,
  dataUser,
  cars,
}) => {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const service = officialTravelRequestService(intraAuth);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        ...record,
        startDate: record.startDate ? dayjs(record.startDate) : null,
        endDate: record.endDate ? dayjs(record.endDate) : null,
      });
    } else {
      form.resetFields();
    }
  }, [record, form]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        id: record?.id,
        startDate: values.startDate?.toISOString() || null,
        endDate: values.endDate?.toISOString() || null,
      };

      await service.updateOfficialTravelRequest(payload);
      message.success("แก้ไขคำขอสำเร็จ");
      fetchData();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("แก้ไขคำขอไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const formatBuddhist = (date: dayjs.Dayjs | null) => {
    if (!date) return "";
    const day = date.date();
    const month = date.locale("th").format("MMMM"); // เดือนภาษาไทย
    const year = date.year() + 543; // แปลงเป็น พ.ศ.
    return `${day} ${month} ${year}`;
  };

  return (
    <Modal
      title="แก้ไขคำขอไปราชการ"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="เรียน"
                name="recipient"
                rules={[{ required: true, message: "กรุณากรอกเรียน..." }]}
              >
                <Input placeholder="กรอกเรียน..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="เลขที่เอกสาร"
                name="documentNo"
                rules={[
                  { required: true, message: "กรุณากรอกเลขที่เอกสาร" },
                  { max: 15, message: "กรอกได้สูงสุด 15 ตัวอักษร" },
                ]}
              >
                <Input placeholder="เช่น 0933.1/85" maxLength={15} />
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
                  format={(value) =>
                    value ? formatBuddhist(dayjs(value)) : ""
                  }
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
                  format={(value) =>
                    value ? formatBuddhist(dayjs(value)) : ""
                  }
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
                <InputNumber min={1} style={{ width: "100%" }} />
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
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="หมายเหตุเพิ่มเติม" name="title">
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

export default OfficialTravelRequestEditModal;
