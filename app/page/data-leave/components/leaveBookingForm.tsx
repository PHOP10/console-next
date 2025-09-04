"use client";

import React, { useMemo } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Select,
  Table,
} from "antd";
import dayjs from "dayjs";
import { DataLeaveType, MasterLeaveType } from "../../common";
import { useSession } from "next-auth/react";

interface LeaveBookingFormProps {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  createDataLeave: (body: any) => Promise<any>;
  masterLeaves: MasterLeaveType[];
  leaveByUserId?: DataLeaveType[];
}

export default function LeaveBookingForm({
  loading,
  setLoading,
  createDataLeave,
  masterLeaves,
  leaveByUserId = [],
}: LeaveBookingFormProps) {
  const [form] = Form.useForm();
  const { data: session } = useSession();
  const { RangePicker } = DatePicker;
  const { TextArea } = Input;

  // ฟังก์ชันคำนวณจำนวนวันลา
  const calculateDays = (start: string | Date, end: string | Date) => {
    if (!start || !end) return 0;
    return dayjs(end).endOf("day").diff(dayjs(start).startOf("day"), "day") + 1;
  };

  // ดึงค่าที่เลือกในฟอร์ม
  const selectedTypeId = Form.useWatch("typeId", form);
  const selectedLeaveDates = Form.useWatch("leaveDates", form);
  console.log("leaveByUserId", leaveByUserId);
  // ✅ คำนวณข้อมูลตาราง
  const tableData = useMemo(() => {
    return masterLeaves.map((leave) => {
      // ลามาแล้ว
      const usedDays = leaveByUserId
        .filter(
          (item) => item.typeId === leave.id && item.status === "approved"
        )
        .reduce(
          (sum, item) => sum + calculateDays(item.dateStart, item.dateEnd),
          0
        );
      console.log("usedDays", usedDays);
      // ลาครั้งนี้ (ถ้าเลือกตรงกับประเภทนี้)
      const currentDays =
        selectedTypeId === leave.id && selectedLeaveDates?.length === 2
          ? calculateDays(selectedLeaveDates[0], selectedLeaveDates[1])
          : 0;
      console.log("currentDays", currentDays);
      // รวมการลา
      const totalDays = usedDays + currentDays;
      console.log("totalDays", totalDays);

      return {
        key: leave.id,
        leaveType: leave.leaveType,
        usedDays,
        currentDays,
        totalDays,
      };
    });
  }, [masterLeaves, leaveByUserId, selectedTypeId, selectedLeaveDates]);

  const columns = [
    { title: "ประเภทการลา", dataIndex: "leaveType", key: "leaveType" },
    { title: "ลามาแล้ว (วัน)", dataIndex: "usedDays", key: "usedDays" },
    { title: "ลาครั้งนี้ (วัน)", dataIndex: "currentDays", key: "currentDays" },
    { title: "รวมการลา (วัน)", dataIndex: "totalDays", key: "totalDays" },
  ];

  const onFinish = async (values: any) => {
    const payload = {
      reason: values.reason,
      dateStart: values.leaveDates?.[0]
        ? dayjs(values.leaveDates[0]).startOf("day").toISOString()
        : null,
      dateEnd: values.leaveDates?.[1]
        ? dayjs(values.leaveDates[1]).endOf("day").toISOString()
        : null,
      details: values.details || null,
      typeId: values.typeId,
      status: "pending",
      createdById: session?.user?.userId || null,
      createdName: session?.user?.fullName || null,
    };

    try {
      setLoading(true);
      await createDataLeave(payload);
      message.success("บันทึกใบลาสำเร็จ");
      form.resetFields();
    } catch (err) {
      message.error("ไม่สามารถบันทึกใบลาได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row gutter={24}>
      {/* ฟอร์ม */}
      <Col span={12}>
        <Card title="ยื่นใบลา">
          <Form form={form} layout="vertical" onFinish={onFinish}>
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
              <TextArea rows={3} placeholder="เช่น ลาป่วย" />
            </Form.Item>

            <Form.Item
              label="ช่วงวันที่ลา"
              name="leaveDates"
              rules={[{ required: true, message: "กรุณาเลือกช่วงวันที่ลา" }]}
            >
              <RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="หมายเหตุเพิ่มเติม" name="details">
              <TextArea rows={3} placeholder="เช่น มีใบรับรองแพทย์" />
            </Form.Item>

            <Form.Item style={{ textAlign: "center", marginTop: 20 }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                ส่งใบลา
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>

      {/* ตาราง */}
      <Col span={12}>
        <Card title="สรุปการลา">
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            bordered
          />
        </Card>
      </Col>
    </Row>
  );
}
