"use client";

import React, { useState } from "react";
import { Modal, Form, Input, DatePicker, Collapse, Tag } from "antd";
import dayjs from "dayjs";
import moment from "moment";
import "moment/locale/th";
import {
  Calendar,
  momentLocalizer,
  Event as RbcEvent,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CaretRightOutlined } from "@ant-design/icons";
import { MaCarType } from "../../common";
import { useForm } from "antd/es/form/Form";
const localizer = momentLocalizer(moment);

interface CustomEvent extends RbcEvent {
  id: number;
  status: string;
  title: string;
  location: string;
  masterCar: string;
  passengers: number;
  budget?: number;
}

interface Props {
  data: MaCarType[];
  loading: boolean;
  fetchData: () => void;
}

const MaCarCalendar: React.FC<Props> = ({ data }) => {
  const [form] = useForm();
  const [selected, setSelected] = useState<MaCarType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approve":
        return "green";
      case "cancel":
        return "red";
      case "pending":
        return "blue";
      default:
        return "blue";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "approve":
        return "อนุมัติ";
      case "cancel":
        return "ยกเลิก";
      case "pending":
        return "รอดำเนินการ";
      default:
        return status;
    }
  };

  const onSelectEvent = (event: CustomEvent) => {
    const item = data.find((d) => d.id === event.id);
    if (item) {
      setSelected(item);
      form.setFieldsValue({
        ...item,
        departureDate: dayjs(item.dateStart),
        returnDate: dayjs(item.dateEnd),
      });
      setModalOpen(true);
    }
  };

  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const formatBuddhist = (date?: string | Date) => {
    if (!date) return "-";
    const d = dayjs(date);
    const day = d.date();
    const month = thaiMonths[d.month()];
    const year = d.year() + 543; 
    return `${day} ${month} ${year}`;
  };

  return (
    <>
      <Calendar<CustomEvent>
        localizer={localizer}
        events={data.map(
          (item): CustomEvent => ({
            id: item.id,
            title: item.purpose,
            start: new Date(item.dateStart),
            end: new Date(item.dateEnd),
            status: item.status,
            location: item.destination,
            masterCar: `ID: ${item.carId}`,
            passengers: item.passengers,
            budget: item.budget,
          })
        )}
        style={{ height: 500 }}
        onSelectEvent={onSelectEvent}
        eventPropGetter={(event: CustomEvent) => ({
          style: {
            backgroundColor: getStatusColor(event.status),
            color: "#fff",
            fontSize: 12,
            borderRadius: 4,
          },
        })}
        messages={{
          next: "ถัดไป",
          previous: "ก่อนหน้า",
          today: "วันนี้",
          month: "เดือน",
          week: "สัปดาห์",
          day: "วัน",
          agenda: "กำหนดการ",
          date: "วันที่",
          time: "เวลา",
          event: "เหตุการณ์",
          showMore: (total) => `+ ดูอีก ${total}`,
        }}
      />

      <Modal
        title="รายละเอียดการจองรถ"
        open={modalOpen}
        width={600}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        {selected && (
          <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Collapse
              bordered={false}
              defaultActiveKey={["1", "2"]}
              expandIcon={({ isActive }) => (
                <CaretRightOutlined rotate={isActive ? 90 : 0} />
              )}
            >
              <Collapse.Panel header="ข้อมูลการจอง" key="1">
                <Form.Item label="ผู้ขอใช้รถ" name="requesterName">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="วัตถุประสงค์" name="purpose">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="ปลายทาง" name="destination">
                  <Input disabled />
                </Form.Item>

                <Form.Item label="ตั้งแต่วันที่">
                  <Input value={formatBuddhist(selected.dateStart)} disabled />
                </Form.Item>

                <Form.Item label="ถึงวันที่">
                  <Input value={formatBuddhist(selected.dateEnd)} disabled />
                </Form.Item>

                <Form.Item label="จำนวนผู้โดยสาร" name="passengers">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="งบประมาณ" name="budget">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="รหัสรถ" name="carId">
                  <Input disabled />
                </Form.Item>
              </Collapse.Panel>
              <Collapse.Panel header="สถานะ" key="2">
                <Form.Item label="สถานะ">
                  <Tag color={getStatusColor(selected.status)}>
                    {getStatusLabel(selected.status)}
                  </Tag>
                </Form.Item>
              </Collapse.Panel>
            </Collapse>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default MaCarCalendar;
