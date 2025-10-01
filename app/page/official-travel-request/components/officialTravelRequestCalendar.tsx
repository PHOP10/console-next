"use client";

import React, { useState } from "react";
import { Modal, Form, Input, DatePicker, Collapse, Tag } from "antd";
import {
  Calendar,
  momentLocalizer,
  Event as RbcEvent,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CaretRightOutlined } from "@ant-design/icons";
import { OfficialTravelRequestType, UserType } from "../../common";
import { useForm } from "antd/es/form/Form";
import dayjs from "dayjs";
import moment from "moment";
import "moment/locale/th";

const localizer = momentLocalizer(moment);

interface CustomEvent extends RbcEvent {
  id: number;
  status: string;
  title: string;
  location: string;
  MasterCar?: {
    licensePlate: string;
    brand: string;
    model: string;
  };
  masterCar: string;
}

interface Props {
  data: OfficialTravelRequestType[];
  loading: boolean;
  fetchData: () => void;
  dataUser: UserType[];
}

const OfficialTravelRequestCalendar: React.FC<Props> = ({ data, dataUser }) => {
  const [form] = useForm();
  const [selected, setSelected] = useState<OfficialTravelRequestType | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const { TextArea } = Input;

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
      case "pending":
        return "รอดำเนินการ";
      case "cancel":
        return "ยกเลิก";
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
        startDate: dayjs(item.startDate),
        endDate: dayjs(item.endDate),
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
    const month = thaiMonths[d.month()]; // month() คืน 0-11
    const year = d.year() + 543; // แปลงเป็น พ.ศ.
    return `${day} ${month} ${year}`;
  };

  return (
    <>
      <Calendar<CustomEvent>
        localizer={localizer}
        events={data.map(
          (item): CustomEvent => ({
            id: item.id,
            title: item.createdName,
            start: new Date(item.startDate),
            end: new Date(item.endDate),
            status: item.status,
            location: `${item.location}`,
            masterCar: item.MasterCar?.licensePlate || "",
            allDay: false,
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
        title="รายละเอียดการเดินทางไปราชการ"
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
              <Collapse.Panel header="ข้อมูลคำขอ" key="1">
                <Form.Item label="ผู้ยื่นคำขอ" name="createdName">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="เรียน" name="recipient">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="เลขที่เอกสาร" name="documentNo">
                  <Input disabled />
                </Form.Item>
                {/* <Form.Item label="เรื่อง" name="title">
                  <Input disabled />
                </Form.Item> */}
                <Form.Item label="วัตถุประสงค์" name="missionDetail">
                  <TextArea disabled />
                </Form.Item>
                <Form.Item label="สถานที่" name="location">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="ตั้งแต่วันที่">
                  <Input value={formatBuddhist(selected.startDate)} disabled />
                </Form.Item>
                <Form.Item label="ถึงวันที่">
                  <Input value={formatBuddhist(selected.endDate)} disabled />
                </Form.Item>
                <Form.Item label="งบประมาณ" name="budget">
                  <Input disabled />
                </Form.Item>
                {selected.MasterCar && (
                  <Form.Item label="รถที่ใช้">
                    <Input
                      disabled
                      value={`${selected.MasterCar.licensePlate} (${selected.MasterCar.brand} ${selected.MasterCar.model})`}
                    />
                  </Form.Item>
                )}
                <Form.Item label="จำนวนผู้โดยสาร" name="passengers">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="รายชื่อผู้โดยสาร">
                  {Array.isArray(selected.passengerNames) &&
                  selected.passengerNames.length > 0 ? (
                    selected.passengerNames.map((uid: string) => {
                      const user = dataUser.find((u) => u.userId === uid);
                      return (
                        <Tag key={uid} color="blue">
                          {user ? `${user.firstName} ${user.lastName}` : uid}
                        </Tag>
                      );
                    })
                  ) : (
                    <span>-</span>
                  )}
                </Form.Item>
                <Form.Item label="เหตุผลเพิ่มเติม" name="note">
                  <TextArea disabled />
                </Form.Item>
              </Collapse.Panel>

              <Collapse.Panel header="สถานะ" key="2">
                <Form.Item label="สถานะ">
                  <Tag color={getStatusColor(selected.status)}>
                    {getStatusLabel(selected.status)}
                  </Tag>
                </Form.Item>

                {selected.approvedByName ? (
                  <>
                    <Form.Item label="ผู้อนุมัติ" name="approvedByName">
                      <Input disabled />
                    </Form.Item>

                    <Form.Item label="วันที่อนุมัติ">
                      <Input
                        value={formatBuddhist(selected.approvedDate)}
                        disabled
                      />
                    </Form.Item>
                  </>
                ) : selected.cancelName ? (
                  <>
                    <Form.Item label="ผู้ยกเลิก" name="cancelName">
                      <Input disabled />
                    </Form.Item>

                    <Form.Item label="วันที่ยกเลิก">
                      <Input
                        value={formatBuddhist(selected.cancelAt)}
                        disabled
                      />
                    </Form.Item>
                  </>
                ) : null}

                {selected.cancelReason ? (
                  <>
                    <Form.Item label="เหตุผลการยกเลิก" name="cancelReason">
                      <Input disabled />
                    </Form.Item>
                  </>
                ) : null}
              </Collapse.Panel>
            </Collapse>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default OfficialTravelRequestCalendar;
