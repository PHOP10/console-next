"use client";
import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  message,
  ConfigProvider,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import { DataLeaveService } from "../services/dataLeave.service";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import th_TH from "antd/locale/th_TH";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

interface DataLeaveEditProps {
  open: boolean;
  record: DataLeaveType | null;
  masterLeaves: MasterLeaveType[];
  onClose: () => void;
  onUpdate: (updated: DataLeaveType) => void;
  fetchData: () => Promise<void>;
  leaveByUserId: DataLeaveType[];
  user: UserType[];
  formEdit: any;
}

export default function DataLeaveEdit({
  open,
  record,
  masterLeaves,
  onClose,
  onUpdate,
  fetchData,
  leaveByUserId,
  user,
  formEdit,
}: DataLeaveEditProps) {
  const intraAuth = useAxiosAuth();
  const service = DataLeaveService(intraAuth);

  React.useEffect(() => {
    if (open && record) {
      formEdit.setFieldsValue({
        typeId: record.typeId,
        reason: record.reason,
        details: record.details,
        writeAt: record.writeAt,
        dateStart: dayjs(record.dateStart),
        dateEnd: dayjs(record.dateEnd),
        contactAddress: record.contactAddress,
        contactPhone: record.contactPhone,
        backupUserId: record.backupUserId,
      });
    } else if (!open) {
      formEdit.resetFields();
    }
  }, [open, record, formEdit]);

  const selectedDateStart = Form.useWatch("dateStart", formEdit);

  const handleOk = async () => {
    try {
      const values = await formEdit.validateFields();
      if (!record) return;

      const updateData = {
        typeId: values.typeId,
        dateStart: values.dateStart.startOf("day").toISOString(),
        dateEnd: values.dateEnd.endOf("day").toISOString(),
        reason: values.reason,
        details: values.details,
        status: record.status === "edit" ? "pending" : record.status,
        writeAt: values.writeAt,
        backupUserId: values.backupUserId,
        contactAddress: values.contactAddress,
        contactPhone: values.contactPhone,
      };
      const payload = {
        id: record.id,
        ...updateData,
      };

      await service.updateDataLeave(payload);
      message.success("แก้ไขข้อมูลเรียบร้อย");
      fetchData();
      onUpdate({ ...record, ...updateData });
      onClose();
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถแก้ไขข้อมูลได้");
    }
  };

  // --- Style Constants ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  const selectStyle =
    "h-11 w-full [&>.ant-select-selector]:!rounded-xl [&>.ant-select-selector]:!border-gray-300 [&>.ant-select-selector]:!shadow-sm hover:[&>.ant-select-selector]:!border-blue-400";

  return (
    <Modal
      title={
        <div className="text-xl font-bold text-[#0683e9] text-center w-full">
          แก้ไขข้อมูลการลา
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={() => {
        onClose();
      }}
      okText="บันทึก"
      cancelText="ยกเลิก"
      width={800}
      centered
      okButtonProps={{
        className:
          "h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0",
      }}
      cancelButtonProps={{
        className:
          "h-10 px-6 rounded-lg text-gray-600 hover:bg-gray-100 border-gray-300",
      }}
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
        <Form form={formEdit} layout="vertical" preserve={false}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="เขียนที่"
                name="writeAt"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอกเขียนที่...",
                  },
                ]}
              >
                <Select
                  placeholder="เขียนที่"
                  className={selectStyle}
                  onChange={(value) => {
                    formEdit.setFieldValue(
                      "writeAt",
                      value === "other" ? "" : value,
                    );
                  }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ display: "flex", padding: 8 }}>
                        <Input
                          placeholder="กรอกอื่น ๆ..."
                          className="rounded-lg"
                          onPressEnter={(e) => {
                            formEdit.setFieldValue(
                              "writeAt",
                              e.currentTarget.value,
                            );
                          }}
                          onBlur={(e) => {
                            formEdit.setFieldValue(
                              "writeAt",
                              e.currentTarget.value,
                            );
                          }}
                        />
                      </div>
                    </>
                  )}
                >
                  <Select.Option value="รพ.สต.บ้านผาผึ้ง">
                    รพ.สต.บ้านผาผึ้ง
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="ประเภทการลา"
                name="typeId"
                rules={[{ required: true, message: "กรุณาเลือกประเภทลา" }]}
              >
                <Select placeholder="เลือกประเภทลา" className={selectStyle}>
                  {masterLeaves.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.leaveType}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="เหตุผล"
            name="reason"
            rules={[{ required: true, message: "กรุณากรอกเหตุผล" }]}
          >
            <Input.TextArea
              rows={2}
              placeholder="กรอกเหตุผลการลา"
              maxLength={50}
              className={textAreaStyle}
            />
          </Form.Item>

          <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 mb-4">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="ตั้งแต่วันที่"
                  name="dateStart"
                  rules={[
                    { required: true, message: "กรุณาเลือกวันที่เริ่มลา" },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    style={{ width: "100%" }}
                    placeholder="เลือกวันที่เริ่มลา"
                    className={`${inputStyle} pt-2`}
                    onChange={() => {
                      formEdit.setFieldValue("dateEnd", null);
                    }}
                    disabledDate={(current) => {
                      if (!current) return false;
                      if (current < dayjs().startOf("day")) return true;
                      return leaveByUserId.some((leave) => {
                        // ต้องไม่เช็คซ้ำกับรายการตัวเอง (กรณีนี้ record.id มีอยู่แล้ว แต่อาจต้องกรองเพิ่มถ้า backend ไม่กรองให้)
                        // สมมติว่า leaveByUserId รวม record ปัจจุบันด้วย การเช็คตรงนี้อาจทำให้เลือกวันเดิมไม่ได้
                        // หากต้องการแก้ให้เลือกวันเดิมได้ ต้องกรอง leave.id !== record.id ออกก่อน (ถ้ามี id)
                        if (leave.id === record?.id) return false;

                        const start = dayjs(leave.dateStart).startOf("day");
                        const end = dayjs(leave.dateEnd).endOf("day");
                        return dayjs(current).isBetween(
                          start,
                          end,
                          "day",
                          "[]",
                        );
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="ถึงวันที่"
                  name="dateEnd"
                  rules={[
                    {
                      required: true,
                      message: "กรุณาเลือกวันที่สิ้นสุดการลา",
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    style={{ width: "100%" }}
                    className={`${inputStyle} pt-2`}
                    placeholder={
                      selectedDateStart
                        ? "เลือกวันที่สิ้นสุด"
                        : "เลือกวันเริ่มก่อน"
                    }
                    disabled={!selectedDateStart}
                    disabledDate={(current) => {
                      if (!current) return false;
                      if (
                        selectedDateStart &&
                        current < dayjs(selectedDateStart).startOf("day")
                      ) {
                        return true;
                      }
                      if (current < dayjs().startOf("day")) return true;
                      return leaveByUserId.some((leave) => {
                        if (leave.id === record?.id) return false;
                        const start = dayjs(leave.dateStart).startOf("day");
                        const end = dayjs(leave.dateEnd).endOf("day");
                        return dayjs(current).isBetween(
                          start,
                          end,
                          "day",
                          "[]",
                        );
                      });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="ระหว่างลาติดต่อได้ที่"
                name="contactAddress"
                rules={[{ required: false }]}
              >
                <Input.TextArea
                  rows={2}
                  maxLength={50}
                  placeholder="กรอกที่อยู่ติดต่อ"
                  className={textAreaStyle}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="เบอร์ติดต่อระหว่างลา"
                name="contactPhone"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอก เบอร์โทรศัพท์",
                  },
                ]}
              >
                <Input
                  placeholder="กรอกเบอร์โทรศัพท์"
                  maxLength={10}
                  className={inputStyle}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="ผู้รับผิดชอบงานระหว่างลา"
            name="backupUserId"
            rules={[
              {
                required: true,
                message: "กรุณาเลือกผู้รับผิดชอบงานระหว่างลา",
              },
            ]}
          >
            <Select placeholder="เลือกผู้รับผิดชอบงาน" className={selectStyle}>
              {user.map((user) => (
                <Select.Option key={user.userId} value={user.userId}>
                  {user.firstName} {user.lastName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="หมายเหตุเพิ่มเติม" name="details">
            <Input.TextArea rows={3} className={textAreaStyle} />
          </Form.Item>
        </Form>
      </ConfigProvider>
    </Modal>
  );
}
