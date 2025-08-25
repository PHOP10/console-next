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

    if (recordReturn) {
      formReturn.setFieldsValue({
        id: recordReturn.id,
        sentDate: record.sentDate ? dayjs(record.sentDate) : null,
        status:
          recordReturn.status === "pending"
            ? "รอดำเนินการ"
            : recordReturn.status === "approve"
            ? "อนุมัติ"
            : recordReturn.status === "cancel"
            ? "ยกเลิก"
            : recordReturn.status === "return"
            ? "รับคืนแล้ว"
            : "",
        note: recordReturn.note,
      });
    }

    setIsModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!recordReturn) return;
    try {
      await intraAuthService.updateMaMedicalEquipment({
        id: recordReturn.id,
        status: "return",
        nameReason: session?.user?.fullName,
        receivedDate: formReturn.getFieldValue("sentDate")?.toISOString(),
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

  const columns: ColumnsType<MaMedicalEquipmentType> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "ข้อมูลเครื่องมือ",
      dataIndex: "items",
      key: "items",
      width: 160,
      render: (items: any[]) => (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {items?.map((item, index) => (
            <li key={index}>{item.medicalEquipment?.equipmentName}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "จำนวน",
      dataIndex: "items",
      key: "items",
      width: 160,
      render: (items: any[]) => (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {items?.map((item, index) => (
            <li key={index}>{item.quantity}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "วันที่ส่ง",
      dataIndex: "sentDate",
      key: "sentDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "ผู้ส่ง",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "วันที่รับคืน",
      dataIndex: "receivedDate",
      key: "receivedDate",
      render: (date: string | null) =>
        date ? dayjs(date).format("DD/MM/YYYY") : "-",
    },
    {
      title: "ผู้รับคืน",
      dataIndex: "nameReason",
      key: "nameReason",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let text = "";

        switch (status) {
          case "pending":
            color = "blue";
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
      render: (note: string | undefined) => note || "-",
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => handleEdit(record)}
          >
            แก้ไข
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => handleOpenModalReturn(record)}
            disabled={record.status !== "approve"}
          >
            รับคืน
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
    // {
    //   title: "วันที่ส่ง",
    //   dataIndex: "sentDate",
    //   key: "sentDate",
    // },
  ];

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
      />

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
                      >
                        {dataEQ.map((eq) => {
                          const selectedIds = (
                            form.getFieldValue("equipmentInfo") || []
                          )
                            .filter((i: any) => i) // กรองค่า undefined
                            .map((i: any) => i.medicalEquipmentId);

                          const currentId = form.getFieldValue([
                            "equipmentInfo",
                            name,
                            "medicalEquipmentId",
                          ]);

                          const isSelected =
                            selectedIds.includes(eq.id) && eq.id !== currentId;

                          return (
                            <Select.Option
                              key={eq.id}
                              value={eq.id}
                              disabled={isSelected}
                            >
                              {eq.equipmentName} (คงเหลือ {eq.quantity})
                            </Select.Option>
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
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="หมายเหตุ" name="note">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
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
    </>
  );
}
