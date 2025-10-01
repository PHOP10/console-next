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
  Radio,
} from "antd";
import dayjs from "dayjs";
import th_TH from "antd/locale/th_TH";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";

interface MaCarEditModalProps {
  open: boolean;
  onClose: () => void;
  record: any;
  cars: any[];
  dataUser: any[];
  fetchData: () => void;
}

const MaCarEditModal: React.FC<MaCarEditModalProps> = ({
  open,
  onClose,
  record,
  cars,
  dataUser,
  fetchData,
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);
  const [form] = Form.useForm();

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        ...record,
        dateStart: record.dateStart ? dayjs(record.dateStart) : null,
        dateEnd: record.dateEnd ? dayjs(record.dateEnd) : null,
      });
    }
  }, [record, form]);

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        id: record?.id,
        dateStart: values.dateStart?.toISOString() || null,
        dateEnd: values.dateEnd?.toISOString() || null,
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

  return (
    <Modal
      title="แก้ไขการจองรถ"
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
                name="purpose"
                label="วัตถุประสงค์"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateStart"
                label="ตั้งแต่วันที่"
                rules={[{ required: true }]}
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
                name="dateEnd"
                label="ถึงวันที่"
                rules={[{ required: true }]}
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
                name="destination"
                label="สถานที่"
                rules={[{ required: true }]}
              >
                <Input />
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
                name="carId"
                label="เลือกรถ"
                rules={[{ required: true }]}
              >
                <Select placeholder="เลือกรถ">
                  {cars.map((car) => (
                    <Select.Option key={car.id} value={car.id}>
                      {car.carName} ({car.licensePlate})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="passengers"
                label="จำนวนผู้โดยสาร"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="กรอกจำนวนผู้โดยสาร"
                />
              </Form.Item>
            </Col>{" "}
            <Col span={12}>
              <Form.Item
                name="passengerNames"
                label="ชื่อผู้โดยสาร"
                rules={[{ required: true, message: "กรุณาเลือกผู้ใช้รถ" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="เลือกผู้ใช้รถ"
                  // loading={loading}
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

export default MaCarEditModal;
