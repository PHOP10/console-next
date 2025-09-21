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
} from "antd";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maCarService } from "../services/maCar.service";
import { useSession } from "next-auth/react";

interface MaCarBookFormProps {
  cars: any[];
  dataUser: any[];
  loading: boolean;
  fetchCarsAndUsers: () => Promise<void>;
}

const MaCarBookForm: React.FC<MaCarBookFormProps> = ({
  cars,
  dataUser,
  loading,
}) => {
  const [form] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const intraAuthService = maCarService(intraAuth);
  const { data: session } = useSession();

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        status: "pending",
      };
      await intraAuthService.createMaCar(payload);
      message.success("จองรถสำเร็จ");
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถจองรถได้");
    }
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          requesterName: session?.user?.fullName,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="requesterName"
              label="ผู้ขอใช้รถ"
              rules={[{ required: true }]}
            >
              <Input disabled />
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
              label="วันเริ่มเดินทาง"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dateEnd"
              label="วันกลับ"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="destination"
              label="ปลายทาง"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="budget" label="งบประมาณ">
              <InputNumber min={0} step={100} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="carId" label="เลือกรถ" rules={[{ required: true }]}>
          <Select placeholder="เลือกรถ" loading={loading}>
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
            loading={loading}
            options={dataUser.map((u) => ({
              label: `${u.firstName} ${u.lastName}`,
              value: u.userId,
            }))}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            จองรถ
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default MaCarBookForm;
