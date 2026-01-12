"use client";
import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  message,
  Card,
  ConfigProvider,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import { DataLeaveService } from "../services/dataLeave.service";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import th_TH from "antd/locale/th_TH";
import { User } from "next-auth";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { TextArea } = Input;

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
  // const [formEdit] = Form.useForm();
  const intraAuth = useAxiosAuth();
  const service = DataLeaveService(intraAuth);

  // React.useEffect(() => {
  //   if (record) {
  //     formEdit.setFieldsValue({
  //       typeId: record.typeId,
  //       reason: record.reason,
  //       details: record.details,
  //       writeAt: record.writeAt,
  //       dateStart: dayjs(record.dateStart),
  //       dateEnd: dayjs(record.dateEnd),
  //       contactAddress: record.contactAddress,
  //       contactPhone: record.contactPhone,
  //       backupUserId: record.backupUserId,
  //     });
  //   }
  // }, [record]);

  React.useEffect(() => {
    if (open && record) {
      // จังหวะเปิด Modal: เซตค่าจาก record เข้าไปในฟอร์ม
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
      // จังหวะปิด Modal (open === false): รีเซ็ตค่าที่ค้างในฟอร์มทั้งหมด
      formEdit.resetFields();
    }
  }, [open, record, formEdit]);

  const selectedTypeId = Form.useWatch("typeId", formEdit);
  const selectedDateStart = Form.useWatch("dateStart", formEdit);
  const selectedDateEnd = Form.useWatch("dateEnd", formEdit);

  const handleOk = async () => {
    try {
      const values = await formEdit.validateFields();
      if (!record) return;

      // ส่งเฉพาะข้อมูลที่ต้องการแก้ไข
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
      // update ตารางด้วยข้อมูลที่ merge กับ record เดิม
      onUpdate({ ...record, ...updateData });
      onClose();
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถแก้ไขข้อมูลได้");
    }
  };

  return (
    <Modal
      title={
        <div
          style={{
            textAlign: "center",
            color: "#0683e9",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          แก้ไขข้อมูลการลา
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={() => {
        onClose(); // 1. เรียกฟังก์ชันปิดที่ส่งมาจากตัวแม่ (เพื่อให้ open กลายเป็น false)
        // formEdit.resetFields(); // 2. รีเซ็ตค่าในฟอร์มกลับเป็นค่าเดิม
      }}
      okText="บันทึก"
      cancelText="ยกเลิก"
    >
      <Card>
        <ConfigProvider locale={th_TH}>
          <Form form={formEdit} layout="vertical" preserve={false}>
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
                onChange={(value) => {
                  formEdit.setFieldValue(
                    "writeAt",
                    value === "other" ? "" : value
                  );
                }}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <div style={{ display: "flex", padding: 8 }}>
                      <Input
                        placeholder="กรอกอื่น ๆ..."
                        onPressEnter={(e) => {
                          formEdit.setFieldValue(
                            "writeAt",
                            e.currentTarget.value
                          );
                        }}
                        onBlur={(e) => {
                          formEdit.setFieldValue(
                            "writeAt",
                            e.currentTarget.value
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
                {/* <Select.Option value="other">อื่นๆ...</Select.Option> */}
              </Select>
            </Form.Item>

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
              label="เหตุผล"
              name="reason"
              rules={[{ required: true, message: "กรุณากรอกเหตุผล" }]}
            >
              <Input.TextArea
                rows={2}
                placeholder="กรอกเหตุผลการลา"
                maxLength={50}
              />
            </Form.Item>

            <Row gutter={8}>
              <Col span={12}>
                <Form.Item
                  label="ตั้งแต่วันที่"
                  name="dateStart"
                  rules={[
                    { required: true, message: "กรุณาเลือกวันที่เริ่มลา" },
                  ]}
                >
                  <DatePicker
                    format={(value) =>
                      value
                        ? `${value.format("DD / MMMM")} / ${value.year() + 543}`
                        : ""
                    }
                    style={{ width: "100%" }}
                    placeholder="เลือกวันที่เริ่มลา"
                    onChange={() => {
                      // ล้างค่า dateEnd เมื่อเปลี่ยน dateStart
                      formEdit.setFieldValue("dateEnd", null);
                    }}
                    disabledDate={(current) => {
                      if (!current) return false;
                      // ห้ามเลือกวันในอดีต
                      if (current < dayjs().startOf("day")) return true;

                      // ตรวจสอบว่าทับกับการลาที่มีอยู่แล้วหรือไม่
                      return leaveByUserId.some((leave) => {
                        const start = dayjs(leave.dateStart).startOf("day");
                        const end = dayjs(leave.dateEnd).endOf("day");
                        return dayjs(current).isBetween(
                          start,
                          end,
                          "day",
                          "[]"
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
                >
                  <DatePicker
                    format={(value) =>
                      value
                        ? `${value.format("DD / MMMM")} / ${value.year() + 543}`
                        : ""
                    }
                    style={{ width: "100%" }}
                    placeholder={
                      selectedDateStart
                        ? // ? `เลือกตั้งแต่ ${dayjs(selectedDateStart).format(
                          //     "DD/MM/YYYY"
                          //   )} เป็นต้นไป`
                          `เลือกวันที่สิ้นสุดการลา`
                        : "กรุณาเลือกวันที่เริ่มลาก่อน"
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
                        const start = dayjs(leave.dateStart).startOf("day");
                        const end = dayjs(leave.dateEnd).endOf("day");
                        return dayjs(current).isBetween(
                          start,
                          end,
                          "day",
                          "[]"
                        );
                      });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="ระหว่างลาติดต่อได้ที่"
              name="contactAddress"
              rules={[{ required: false }]}
            >
              <TextArea
                rows={2}
                maxLength={50}
                placeholder="กรอกระหว่างลาติดต่อได้ที่"
              />
            </Form.Item>

            {/* เบอร์โทรศัพท์ */}
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
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
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
              <Select placeholder="เลือกผู้รับผิดชอบงาน">
                {user.map((user) => (
                  <Select.Option key={user.userId} value={user.userId}>
                    {user.firstName} {user.lastName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="หมายเหตุเพิ่มเติม" name="details">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </ConfigProvider>
      </Card>
    </Modal>
  );
}
