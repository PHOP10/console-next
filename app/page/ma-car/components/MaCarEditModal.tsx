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
} from "antd";
import dayjs from "dayjs";

interface MaCarEditModalProps {
  open: boolean;
  onClose: () => void;
  record: any;
  cars: any[];
  dataUser: any[];
  onUpdate: (values: any) => Promise<void>;
}

const MaCarEditModal: React.FC<MaCarEditModalProps> = ({
  open,
  onClose,
  record,
  cars,
  dataUser,
  onUpdate,
}) => {
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...record,
        ...values,
        dateStart: values.dateStart?.toISOString() || null,
        dateEnd: values.dateEnd?.toISOString() || null,
      };
      await onUpdate(payload);
      message.success("แก้ไขการจองสำเร็จ");
      onClose();
    } catch (error) {
      console.error(error);
      message.error("แก้ไขไม่สำเร็จ");
    }
  };

  return (
    <Modal
      title="แก้ไขการจองรถ"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="บันทึก"
      cancelText="ยกเลิก"
      width={700}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="requesterName"
          label="ผู้ขอใช้รถ"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="purpose"
          label="วัตถุประสงค์"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="dateStart"
          label="วันเริ่มเดินทาง"
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          name="dateEnd"
          label="วันกลับ"
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          name="destination"
          label="ปลายทาง"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="budget" label="งบประมาณ">
          <InputNumber min={0} step={100} style={{ width: "100%" }} />
        </Form.Item>

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

        <Form.Item
          name="passengers"
          label="จำนวนผู้โดยสาร"
          rules={[{ required: true }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="passengerNames"
          label="ชื่อผู้ใช้รถ"
          rules={[{ required: true, message: "กรุณาเลือกผู้ใช้รถ" }]}
        >
          <Select
            mode="multiple"
            placeholder="เลือกผู้ใช้รถ"
            options={dataUser.map((u) => ({
              label: `${u.firstName} ${u.lastName}`,
              value: u.userId,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MaCarEditModal;
