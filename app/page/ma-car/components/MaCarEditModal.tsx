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
  Checkbox,
  Radio,
  Divider,
} from "antd";
import dayjs from "dayjs";
import th_TH from "antd/locale/th_TH";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { MaCarType } from "../../common";
import "dayjs/locale/th";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale("th");
dayjs.extend(isBetween);

interface MaCarEditModalProps {
  open: boolean;
  onClose: () => void;
  record: any;
  cars: any[];
  dataUser: any[];
  fetchData: () => void;
  data: any[]; // รายการจองทั้งหมดเพื่อเช็คซ้ำ
  maCarUser: MaCarType[];
}

const MaCarEditModal: React.FC<MaCarEditModalProps> = ({
  open,
  onClose,
  record,
  cars,
  dataUser,
  fetchData,
  data,
  maCarUser,
}) => {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);
  const [form] = Form.useForm();

  useEffect(() => {
    if (record && open) {
      form.setFieldsValue({
        ...record,
        dateStart: record.dateStart ? dayjs(record.dateStart) : null,
        dateEnd: record.dateEnd ? dayjs(record.dateEnd) : null,
        passengerNames: record.passengerNames || [],
        typeName: Array.isArray(record.typeName)
          ? record.typeName
          : [record.typeName],
      });
    }
  }, [record, open, form]);

  const handleSubmit = async (values: any) => {
    try {
      const { carId, dateStart, dateEnd } = values;

      // ตรวจสอบการจองซ้ำ (Logic เดียวกับหน้าจอง)
      const isOverlap = data?.some((booking) => {
        if (booking.id === record?.id || booking.status === "cancel")
          return false;

        const isSameCar = booking.carId === carId;
        const isTimeOverlap =
          dayjs(dateStart).isBefore(dayjs(booking.dateEnd)) &&
          dayjs(dateEnd).isAfter(dayjs(booking.dateStart));

        return isSameCar && isTimeOverlap;
      });

      if (isOverlap) {
        return message.warning(
          "ไม่สามารถแก้ไขได้: รถคันนี้ถูกจองในช่วงเวลานี้แล้ว",
        );
      }
      const selectedCar = cars.find((c) => c.id === carId);
      const payload = {
        ...values,
        id: record?.id,
        dateStart: dayjs(dateStart).toISOString(),
        dateEnd: dayjs(dateEnd).toISOString(),
        status: record.status === "edit" ? "pending" : record.status,
        startMileage:
          carId !== record?.carId
            ? selectedCar?.mileage || 0
            : record?.startMileage || 0,
      };

      await intraAuthService.updateMaCar(payload);
      message.success("แก้ไขการจองสำเร็จ");
      fetchData();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("แก้ไขไม่สำเร็จ");
    }
  };

  // --- Style Constants ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 transition-all duration-300";
  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 transition-all duration-300";
  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 hover:[&>.ant-select-selector]:!border-blue-400";
  const optionGroupStyle = "bg-gray-50 p-4 rounded-xl border border-gray-200";

  return (
    <Modal
      title={
        <div className="text-xl font-bold text-[#0683e9] text-center w-full">
          แก้ไขการจองรถ
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      styles={{ content: { borderRadius: "20px", padding: "24px" } }}
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Section 1: ประเภทการเดินทาง */}
          <Form.Item
            name="typeName"
            label={
              <span className="font-semibold text-gray-700">
                ประเภทการเดินทางและแผนงาน
              </span>
            }
            rules={[
              { required: true, message: "กรุณาเลือกอย่างน้อย 1 รายการ" },
            ]}
          >
            <Checkbox.Group className={`${optionGroupStyle} w-full`}>
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

          {/* Section 2: ข้อมูลพื้นฐาน */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="recipient"
                label="เรียน"
                rules={[{ required: true }]}
              >
                <Select placeholder="เลือกผู้รับ" className={selectStyle}>
                  <Select.Option value="สาธารณสุขอำเภอวังเจ้า">
                    สาธารณสุขอำเภอวังเจ้า
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="budget"
                label="งบประมาณ"
                rules={[{ required: true }]}
              >
                <Select placeholder="เลือกงบประมาณ" className={selectStyle}>
                  <Select.Option value="งบกลาง">งบกลาง</Select.Option>
                  <Select.Option value="งบโครงการ">งบโครงการ</Select.Option>
                  <Select.Option value="เงินบำรุง">เงินบำรุง</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="purpose"
                label="วัตถุประสงค์"
                rules={[{ required: true }]}
              >
                <Input.TextArea
                  placeholder="กรอกวัตถุประสงค์"
                  rows={1}
                  className={textAreaStyle}
                  style={{ minHeight: "44px" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="destination"
                label="สถานที่"
                rules={[{ required: true }]}
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

          {/* Section 3: ข้อมูลรถและคนขับ (3 Column ตามความต้องการใหม่) */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="พนักงานขับรถ"
                name="driver"
                rules={[{ required: true }]}
              >
                <Radio.Group className={`${optionGroupStyle} py-2 w-full`}>
                  <Radio value="yes">ขอ</Radio>
                  <Radio value="no">ไม่ขอ</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="carId"
                label="เลือกรถ"
                rules={[{ required: true }]}
              >
                <Select placeholder="เลือกรถ" className={selectStyle}>
                  {cars.map((car) => (
                    <Select.Option key={car.id} value={car.id}>
                      {car.carName} ({car.licensePlate})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Section 4: วันเวลาเดินทาง */}
          <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 mb-4">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="dateStart"
                  label="ตั้งแต่วันที่"
                  rules={[{ required: true }]}
                >
                  <DatePicker
                    showTime={{ format: "HH:mm" }}
                    format="DD/MM/YYYY HH:mm"
                    className={`${inputStyle} pt-2`}
                    onChange={() => form.setFieldValue("dateEnd", null)}
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
                    showTime={{ format: "HH:mm" }}
                    format="DD/MM/YYYY HH:mm"
                    className={`${inputStyle} pt-2`}
                    disabled={!form.getFieldValue("dateStart")}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Section 5: ผู้โดยสาร */}
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item
                name="passengers"
                label="จำนวนผู้โดยสาร"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={1}
                  className={inputStyle}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item
                name="passengerNames"
                label="ชื่อผู้โดยสาร"
                rules={[{ required: true }]}
              >
                <Select
                  mode="multiple"
                  className={selectStyle}
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

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button onClick={onClose} className="rounded-lg h-10 px-6">
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="rounded-lg h-10 px-6 bg-[#0683e9]"
            >
              บันทึกการแก้ไข
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
};

export default MaCarEditModal;
