"use client";

import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  message,
  Popconfirm,
  Select,
  Tooltip,
  Card,
} from "antd";
import React, { useEffect, useState, useCallback } from "react";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import {
  MaMedicalEquipmentType,
  MedicalEquipmentType,
} from "../../common/index";
import { useSession } from "next-auth/react";
import MedicalEquipmentTableDetails from "./medicalEquipmentTableDetails";

const { Option } = Select;
const { TextArea } = Input;

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  data: MaMedicalEquipmentType[];
  dataEQ: MedicalEquipmentType[];
};

export default function MedicalEquipmentTable({
  setLoading,
  loading,
  data,
  dataEQ,
}: Props) {
  const [editingItem, setEditingItem] = useState<MaMedicalEquipmentType | null>(
    null
  );
  const intraAuth = useAxiosAuth();
  const intraAuthService = maMedicalEquipmentServices(intraAuth);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formReturn] = Form.useForm();
  const [recordReturn, setRecordReturn] = useState<any>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [recordDetails, setRecordDetails] = useState<any>(null);

  const handleEdit = (item: MaMedicalEquipmentType) => {
    setEditingItem(item);

    const equipmentInfo =
      item.items?.map((i: any) => ({
        medicalEquipmentId: i.medicalEquipmentId,
        quantity: i.quantity,
      })) || [];

    form.setFieldsValue({
      equipmentInfo,
      sentDate: item.sentDate ? dayjs(item.sentDate) : null,
      note: item.note || "",
    });

    setEditModalVisible(true);
  };

  const onEditFinish = async (values: any) => {
    if (!editingItem) return;

    try {
      const payload = {
        id: editingItem.id,
        sentDate: values.sentDate?.toISOString(),
        note: values.note,
        items: values.equipmentInfo.map((eq: any) => ({
          medicalEquipmentId: eq.medicalEquipmentId,
          quantity: eq.quantity,
        })),
      };

      await intraAuthService.updateMedicalEquipmentEdit(payload);

      message.success("บันทึกการแก้ไขเรียบร้อย");
      setEditModalVisible(false);
      setEditingItem(null);
      setLoading(true);
    } catch (error) {
      console.error("อัปเดตข้อมูลไม่สำเร็จ:", error);
      message.error("ไม่สามารถอัปเดตข้อมูลได้");
    }
  };

  const handleOpenModalReturn = (record: any) => {
    setRecordReturn(record);

    formReturn.setFieldsValue({
      id: record.id,
      sentDate: record.sentDate ? dayjs(record.sentDate) : null,
      status:
        record.status === "pending"
          ? "รอดำเนินการ"
          : record.status === "approve"
          ? "อนุมัติ"
          : record.status === "cancel"
          ? "ยกเลิก"
          : record.status === "return"
          ? "รับคืนแล้ว"
          : "",
      note: record.note,
    });

    setIsModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!recordReturn) return;
    try {
      await intraAuthService.updateMaMedicalEquipment({
        id: recordReturn.id,
        status: "return",
        returnName: session?.user?.fullName,
        returndAt: new Date().toISOString(),
        note: formReturn.getFieldValue("note"),
      });

      message.success("รับคืนอุปกรณ์เรียบร้อยแล้ว");
      setIsModalOpen(false);
      setRecordReturn(null);
      setLoading(true);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการรับคืนอุปกรณ์:", error);
      message.error("ไม่สามารถรับคืนอุปกรณ์ได้");
    }
  };

  const handleOpenModalDetails = (record: any) => {
    setRecordDetails(record);
    setOpenDetails(true);
  };

  const columns: ColumnsType<MaMedicalEquipmentType> = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "ชื่อเครื่องมือแพทย์",
      dataIndex: "items",
      key: "items",
      align: "center",
      width: 160,
      render: (items: any[]) => {
        const maxToShow = 2; // แสดงสูงสุด 3 รายการ
        const hasMore = items?.length > maxToShow;
        const displayItems = hasMore ? items.slice(0, maxToShow) : items;

        return (
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {displayItems?.map((item, index) => (
              <li key={index}>{item.medicalEquipment?.equipmentName}</li>
            ))}
            {hasMore && (
              <Tooltip
                title={items
                  .map((item) => item.medicalEquipment?.equipmentName)
                  .join(", ")}
              >
                <li style={{ cursor: "pointer", color: "#1890ff" }}>...</li>
              </Tooltip>
            )}
          </ul>
        );
      },
    },
    {
      title: "จำนวน",
      dataIndex: "items",
      key: "items",
      align: "center",
      width: 160,
      // width: 160,
      render: (items: any[]) => {
        if (!items || items.length === 0) return null;

        const firstThree = items.slice(0, 2);
        const rest = items.slice(2);

        return (
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {firstThree.map((item, index) => (
              <li key={index}>{item.quantity}</li>
            ))}

            {rest.length > 0 && (
              <Tooltip
                title={items.map((item) => item.quantity).join(", ")}
                placement="top"
              >
                <li style={{ cursor: "pointer", color: "#1890ff" }}>...</li>
              </Tooltip>
            )}
          </ul>
        );
      },
    },
    {
      title: "วันที่ส่ง",
      dataIndex: "sentDate",
      key: "sentDate",
      align: "center",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "ชื่อผู้ส่ง",
      dataIndex: "createdBy",
      key: "createdBy",
      align: "center",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        let color = "default";
        let text = "";

        switch (status) {
          case "pending":
            color = "gold";
            text = "รอดำเนินการ";
            break;
          case "approve":
            color = "green";
            text = "อนุมัติ";
            break;
          case "cancel":
            color = "red";
            text = "ยกเลิก";
            break;
          case "return":
            color = "grey";
            text = "รับคืนแล้ว";
            break;
          default:
            text = status;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "หมายเหตุเพิ่มเติม",
      dataIndex: "note",
      key: "note",
      align: "center",

      render: (text: string) => {
        const shortText =
          text && text.length > 20 ? text.substring(0, 25) + "..." : text;
        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "จัดการ",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          {" "}
          {(session?.user?.role === "admin" ||
            session?.user?.role === "pharmacy") && (
            <Button
              size="small"
              onClick={() => handleEdit(record)}
              style={{
                backgroundColor:
                  record.status === "pending" ? "#faad14" : "#d9d9d9",
                borderColor:
                  record.status === "pending" ? "#faad14" : "#d9d9d9",
                color: record.status === "pending" ? "white" : "#888",
                cursor: record.status === "pending" ? "pointer" : "not-allowed",
              }}
              disabled={record.status !== "pending"}
            >
              แก้ไข
            </Button>
          )}
          <Button
            size="small"
            onClick={() => handleOpenModalReturn(record)}
            style={{
              backgroundColor:
                record.status === "approve" ? "#722ed1" : "#d9d9d9",
              borderColor: record.status === "approve" ? "#722ed1" : "#d9d9d9",
              color: record.status === "approve" ? "white" : "#888",
              cursor: record.status === "approve" ? "pointer" : "not-allowed",
            }}
            disabled={record.status !== "approve"}
          >
            รับคืน
          </Button>
          <Button
            type="default"
            size="small"
            style={{
              borderColor: "#d9d9d9",
            }}
            onClick={() => handleOpenModalDetails(record)}
            className="hover-blue"
          >
            รายละเอียด
          </Button>
        </Space>
      ),
    },
  ];

  const columnsReturn = [
    {
      title: "ชื่ออุปกรณ์",
      dataIndex: ["medicalEquipment", "equipmentName"],
      key: "equipmentName",
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
    },
  ];

  return (
    <Card
      bordered
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
      title={
        <div
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#0683e9ff",
          }}
        >
          ข้อมูลเครื่องมือแพทย์
        </div>
      }
    >
      {/* ตาราง */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />

      {/* Modal แก้ไขข้อมูล */}
      <Modal
        title="แก้ไขข้อมูล"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => form.submit()}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onEditFinish}
          initialValues={{ equipmentInfo: [] }}
        >
          <Form.List name="equipmentInfo">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    align="baseline"
                    style={{ display: "flex", marginBottom: 8 }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "medicalEquipmentId"]}
                      rules={[
                        { required: true, message: "กรุณาเลือกเครื่องมือ" },
                      ]}
                    >
                      <Select
                        placeholder="เลือกเครื่องมือ"
                        style={{ width: 200 }}
                        showSearch
                        optionFilterProp="children"
                      >
                        {dataEQ.map((eq) => {
                          const reservedQuantity = dataEQ
                            .flatMap((ma) => ma.items || [])
                            .filter(
                              (item: any) =>
                                item.medicalEquipmentId === eq.id &&
                                ["pending", "approve"].includes(
                                  item.maMedicalEquipment?.status
                                )
                            )
                            .reduce(
                              (sum: number, item: any) => sum + item.quantity,
                              0
                            );

                          const remainingQuantity =
                            eq.quantity - reservedQuantity;

                          const selectedIds = (
                            form.getFieldValue("equipmentInfo") ?? []
                          )
                            .filter((i: any) => i)
                            .map((i: any) => i.medicalEquipmentId)
                            .filter((id: any) => id !== undefined);

                          const isSelected =
                            selectedIds.includes(eq.id) &&
                            eq.id !==
                              form.getFieldValue([
                                "equipmentInfo",
                                name,
                                "medicalEquipmentId",
                              ]);

                          return (
                            <Option
                              key={eq.id}
                              value={eq.id}
                              disabled={isSelected || remainingQuantity <= 0}
                            >
                              {eq.equipmentName} (คงเหลือ {remainingQuantity})
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      rules={[
                        { required: true, message: "กรุณากรอกจำนวน" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const equipmentId = getFieldValue([
                              "equipmentInfo",
                              name,
                              "medicalEquipmentId",
                            ]);
                            if (!equipmentId) return Promise.resolve();
                            const selected = dataEQ.find(
                              (eq) => eq.id === equipmentId
                            );
                            if (value > (selected?.quantity || 0)) {
                              return Promise.reject(
                                new Error(
                                  `จำนวนเกินคงเหลือ (${selected?.quantity})`
                                )
                              );
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <InputNumber min={1} placeholder="จำนวน" />
                    </Form.Item>

                    <Button danger onClick={() => remove(name)}>
                      ลบ
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + เพิ่มรายการเครื่องมือ
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            label="วันที่ส่ง"
            name="sentDate"
            rules={[{ required: true, message: "กรุณาเลือกวันที่ส่ง" }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              disabledDate={(current) => {
                if (!current) return false;
                const today = dayjs().startOf("day");
                if (current < today) return true;

                const bookedDates = data
                  .map((item: any) =>
                    item.sentDate ? dayjs(item.sentDate).startOf("day") : null
                  )
                  .filter(Boolean);

                return bookedDates.some((d: any) => d.isSame(current, "day"));
              }}
            />
          </Form.Item>

          <Form.Item label="หมายเหตุ" name="note">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal รับคืน */}
      <Modal
        title="รายละเอียดการรับคืนอุปกรณ์"
        open={isModalOpen}
        onOk={handleConfirmReturn}
        onCancel={() => setIsModalOpen(false)}
        okText="ยืนยันรับคืน"
        cancelText="ยกเลิก"
        width={700}
      >
        <Form form={formReturn} layout="vertical">
          <Form.Item label="รายการอุปกรณ์ที่ส่ง">
            <Table
              dataSource={recordReturn?.items || []}
              columns={columnsReturn}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Form.Item>

          <Form.Item
            label="วันที่ส่ง"
            name="sentDate"
            rules={[{ required: true, message: "กรุณาเลือกวันที่ส่ง" }]}
          >
            <DatePicker
              disabled
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label="สถานะปัจจุบัน" name="status">
            <Input disabled />
          </Form.Item>

          <Form.Item label="หมายเหตุ" name="note">
            <Input.TextArea disabled rows={3} placeholder="หมายเหตุเพิ่มเติม" />
          </Form.Item>
        </Form>
      </Modal>

      <MedicalEquipmentTableDetails
        record={recordDetails}
        open={openDetails}
        onClose={() => setOpenDetails(false)}
      />
    </Card>
  );
}
