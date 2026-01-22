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
        status: "pending",
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
    const month = date.locale("th").format("MMMM");
    const year = date.year() + 543;
    return `${day} ${month} ${year}`;
  };

  // --- Style Constants (Master Template) ---
  const inputStyle =
    "w-full h-10 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const selectStyle =
    "h-10 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  return (
    <Modal
      title={
        <div className="text-xl font-bold text-[#0683e9] text-center w-full">
          แก้ไขคำขอไปราชการ
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      styles={{
        content: { borderRadius: "20px", padding: "24px" },
        header: {
          marginBottom: "16px",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "12px",
        },
      }}
    >
      <ConfigProvider locale={th_TH}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Section 1: ข้อมูลเอกสาร */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="เรียน"
                name="recipient"
                rules={[{ required: true, message: "กรุณากรอกเรียน..." }]}
              >
                <Input placeholder="กรอกเรียน..." className={inputStyle} />
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
                <Input
                  placeholder="เช่น 0933.1/85"
                  maxLength={15}
                  className={inputStyle}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="วัตถุประสงค์"
                name="missionDetail"
                rules={[{ required: true, message: "กรุณากรอกวัตถุประสงค์" }]}
              >
                <Input.TextArea
                  placeholder="กรอกรายวัตถุประสงค์"
                  rows={2}
                  className={textAreaStyle}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="สถานที่"
                name="location"
                rules={[{ required: true, message: "กรุณากรอกสถานที่" }]}
              >
                <Input.TextArea
                  placeholder="กรอกสถานที่"
                  rows={2}
                  className={textAreaStyle}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Section 2: วันเวลาเดินทาง */}
          <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 mb-4 mt-2">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="ตั้งแต่วันที่"
                  name="startDate"
                  rules={[
                    { required: true, message: "กรุณาเลือกวันที่เริ่มเดินทาง" },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format={(value) =>
                      value ? formatBuddhist(dayjs(value)) : ""
                    }
                    className={`${inputStyle} pt-1`}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="ถึงวันที่"
                  name="endDate"
                  rules={[
                    {
                      required: true,
                      message: "กรุณาเลือกวันที่สิ้นสุดเดินทาง",
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format={(value) =>
                      value ? formatBuddhist(dayjs(value)) : ""
                    }
                    className={`${inputStyle} pt-1`}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Section 3: ข้อมูลเพิ่มเติม */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="budget"
                label="งบประมาณ"
                rules={[{ required: true, message: "กรุณากรอกงบประมาณ" }]}
              >
                <Select placeholder="เลือกงบประมาณ" className={selectStyle}>
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
                <Select placeholder="เลือกรถ" className={selectStyle}>
                  {cars.map((car) => (
                    <Select.Option key={car.id} value={car.id}>
                      {car.licensePlate} ({car.brand} {car.model})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="จำนวนผู้โดยสาร" name="passengers">
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  className={`${inputStyle} pt-1`}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="รายชื่อผู้โดยสาร" name="passengerNames">
                <Select
                  mode="multiple"
                  placeholder="เลือกผู้โดยสาร"
                  optionFilterProp="children"
                  className={selectStyle} // Antd Select mode multiple จะจัดการ style เองบางส่วน
                  maxTagCount="responsive"
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

          <Form.Item label="หมายเหตุเพิ่มเติม" name="note">
            <Input.TextArea
              placeholder="หมายเหตุเพิ่มเติม"
              rows={2}
              className={textAreaStyle}
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              onClick={onClose}
              className="h-10 px-6 rounded-lg text-gray-600 hover:bg-gray-100 border-gray-300"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0"
            >
              บันทึกการแก้ไข
            </Button>
          </div>
        </Form>
      </ConfigProvider>
    </Modal>
  );
};

export default OfficialTravelRequestEditModal;
