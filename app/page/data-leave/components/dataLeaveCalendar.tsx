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
import { DataLeaveType } from "../../common";
import { useForm } from "antd/es/form/Form";

interface CustomEvent extends RbcEvent {
  id: number;
  status: string;
  title: string;
  reason: string;
  details?: string;
  approvedByName?: string;
  createdName?: string;
  leaveType?: string;
  cancelName?: string;
  cancelReason?: string;
}

interface Props {
  data: DataLeaveType[];
  loading: boolean;
  fetchData: () => void;
}

const DataLeaveCalendar: React.FC<Props> = ({ data }) => {
  const [form] = useForm();
  const [selected, setSelected] = useState<DataLeaveType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const localizer = momentLocalizer(moment);

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
        reason: item.reason,
        details: item.details,
        approvedByName: item.approvedByName || "-",
        dateStart: dayjs(item.dateStart),
        dateEnd: dayjs(item.dateEnd),
        createdName: item.createdName || "-",
        leaveType: item.masterLeave?.leaveType || "-",
        cancelName: item.cancelName || "-",
        cancelReason: item.cancelReason || "-",
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
            title: item.reason,
            start: new Date(item.dateStart),
            end: new Date(item.dateEnd),
            status: item.status,
            reason: item.reason,
            details: item.details,
            approvedByName: item.approvedByName,
            createdName: item.createdName,
            leaveType: item.masterLeave?.leaveType,
            cancelName: item.cancelName,
            cancelReason: item.cancelReason,
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
        title="รายละเอียดการลา"
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
              <Collapse.Panel header="ข้อมูลการลา" key="1">
                <Form.Item label="ผู้ลา" name="createdName">
                  <Input disabled />
                </Form.Item>

                <Form.Item label="ประเภทการลา" name="leaveType">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="เหตุผลการลา" name="reason">
                  <Input disabled />
                </Form.Item>
                <Form.Item label="รายละเอียด" name="details">
                  <Input.TextArea rows={3} disabled />
                </Form.Item>
                <Form.Item label="วันที่เริ่มการลา" name="dateStart">
                  <DatePicker
                    disabled
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>

                <Form.Item label="วันที่สิ้นสุดการลา" name="dateEnd">
                  <DatePicker
                    disabled
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>

                <Form.Item label="สถานะ">
                  <Tag color={getStatusColor(selected.status)}>
                    {getStatusLabel(selected.status)}
                  </Tag>
                </Form.Item>
                {selected.approvedByName ? (
                  <Form.Item label="ผู้อนุมัติ" name="approvedByName">
                    <Input disabled value={selected.approvedByName} />
                  </Form.Item>
                ) : selected.cancelName ? (
                  <Form.Item label="ผู้ยกเลิก" name="cancelName">
                    <Input disabled value={selected.cancelName} />
                  </Form.Item>
                ) : null}
                {selected.cancelReason ? (
                  <Form.Item label="เหตุผลการยกเลิก" name="cancelReason">
                    <Input disabled value={selected.cancelReason} />
                  </Form.Item>
                ) : null}
              </Collapse.Panel>
            </Collapse>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default DataLeaveCalendar;
