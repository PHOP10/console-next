"use client";

import React, { useState } from "react";
import { Modal, Form, Input, DatePicker, Collapse, Tag } from "antd";
import dayjs from "dayjs";
import moment from "moment";
import {
  Calendar,
  momentLocalizer,
  Event as RbcEvent,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CaretRightOutlined } from "@ant-design/icons";
import { OfficialTravelRequestType } from "../../common";
import { useForm } from "antd/es/form/Form";

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
}

const OfficialTravelRequestCalendar: React.FC<Props> = ({ data }) => {
  const [form] = useForm();
  const [selected, setSelected] = useState<OfficialTravelRequestType | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const localizer = momentLocalizer(moment);
  const { TextArea } = Input;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approve":
        return "green";
      case "pending":
        return "orange";
      case "cancel":
        return "red";
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

  return (
    <>
      <Calendar<CustomEvent>
        localizer={localizer}
        events={data.map(
          (item): CustomEvent => ({
            id: item.id,
            title: item.title,
            start: new Date(item.startDate),
            end: new Date(item.endDate),
            status: item.status,
            location: `${item.location}`, // หรือรายละเอียดอื่นๆ
            masterCar: item.MasterCar?.licensePlate || "",
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
              defaultActiveKey={["1", "2", "3"]}
              expandIcon={({ isActive }) => (
                <CaretRightOutlined rotate={isActive ? 90 : 0} />
              )}
            >
              <Collapse.Panel header="ข้อมูลคำขอ" key="1">
                <Form.Item label="เลขที่เอกสาร" name="documentNo">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="เรื่อง" name="title">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="รายละเอียดภารกิจ" name="missionDetail">
                  <TextArea disabled />
                </Form.Item>
                <Form.Item label="สถานที่" name="location">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="วันที่เริ่ม" name="startDate">
                  <DatePicker disabled style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="วันที่สิ้นสุด" name="endDate">
                  <DatePicker disabled style={{ width: "100%" }} />
                </Form.Item>
                {selected.MasterCar && (
                  <Form.Item label="รถที่ใช้">
                    <Input
                      disabled
                      value={`${selected.MasterCar.licensePlate} (${selected.MasterCar.brand} ${selected.MasterCar.model})`}
                    />
                  </Form.Item>
                )}
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

export default OfficialTravelRequestCalendar;
