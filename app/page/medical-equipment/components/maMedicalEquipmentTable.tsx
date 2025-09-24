"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  Popover,
  Typography,
  Tooltip,
  Card,
  Row,
  Col,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import {
  MaMedicalEquipmentType,
  MedicalEquipmentType,
} from "../../common/index";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import MedicalEquipmentTableDetails from "./medicalEquipmentTableDetails";

type Props = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  data: MaMedicalEquipmentType[];
  dataEQ: MedicalEquipmentType[];
};

export default function MaMedicalEquipmentTable({
  setLoading,
  loading,
  data,
  dataEQ,
}: Props) {
  const intraAuth = useAxiosAuth();
  const intraAuthService = maMedicalEquipmentServices(intraAuth);
  // const [data, setData] = useState<MaMedicalEquipmentType[]>([]);
  // const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MaMedicalEquipmentType | null>(
    null
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedRecord, setSelectedRecord] =
    useState<MaMedicalEquipmentType | null>(null);
  const [formCancel] = Form.useForm();
  const { data: session } = useSession();
  const [openDetails, setOpenDetails] = useState(false);
  const [recordDetails, setRecordDetails] = useState<any>(null);
  const { TextArea } = Input;
  const { Option } = Select;
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [recordReturn, setRecordReturn] = useState<any>(null);
  const [formReturn] = Form.useForm();

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

  const handleCancel = async (values: any) => {
    if (!selectedRecord) return;
    try {
      await intraAuthService.updateMaMedicalEquipment({
        id: selectedRecord.id,
        status: "cancel",
        cancelReason: values.cancelReason,
        nameReason: session?.user?.fullName,
        createdAt: new Date().toISOString(),
      });

      message.success("ยกเลิกรายการแล้ว");
      setIsModalOpen(false);
      setCancelReason("");
      setSelectedRecord(null);
      setLoading(true);
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      message.error("ไม่สามารถยกเลิกรายการได้");
    }
  };

  const handleApprove = async (record: any) => {
    try {
      await intraAuthService.updateMaMedicalEquipment({
        id: record.id,
        status: "approve",
        approveById: session?.user?.userId,
        approveBy: session?.user?.fullName,
        approveAt: new Date().toISOString(),
      });
      message.success("อนุมัติรายการแล้ว");
      setLoading(true);
      setOpenPopoverId(null);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอนุมัติ:", error);
      message.error("ไม่สามารถอนุมัติได้");
    }
  };

  const handleOpenModalDetails = (record: any) => {
    setRecordDetails(record);
    setOpenDetails(true);
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
      returnName: record.returnName,
    });

    setIsModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!recordReturn) return;
    try {
      await intraAuthService.updateMaMedicalEquipment({
        id: recordReturn.id,
        status: "verified",
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

  const columns: ColumnsType<MaMedicalEquipmentType> = [
    {
      title: "ลำดับ",
      dataIndex: "id",
      key: "id",
      width: 45,
      align: "center",
    },
    {
      title: "รายการ/ชื่อเครื่องมือ",
      dataIndex: "items",
      key: "items",
      width: 200,
      align: "center",
      render: (items: any[]) => {
        const maxToShow = 2;
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
      width: 160,
      align: "center",

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
      render: (date: string) => {
        if (!date) return "-";
        return dayjs(date).format("D MMMM BBBB");
      },
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
            color = "purple";
            text = "คืนแล้ว"; // 👈 ผู้ใช้คืนเครื่องมือ
            break;
          case "verified":
            color = "grey"; // 👈 เลือกสีใหม่ (แนะนำฟ้า)
            text = "ตรวจรับคืนแล้ว"; // 👈 หัวหน้ายืนยัน
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
      title: "การจัดการ",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="ยืนยันการลบ"
            description="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
            onConfirm={async () => {
              try {
                await intraAuthService.deleteMaMedicalEquipment(record.id);
                message.success("ลบข้อมูลสำเร็จ");
                setLoading(true);
              } catch (error) {
                console.error("เกิดข้อผิดพลาดในการลบ:", error);
                message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
              }
            }}
            okText="ใช่"
            cancelText="ยกเลิก"
          >
            <Button danger size="small">
              ลบ
            </Button>
          </Popconfirm>

          <Button
            size="small"
            onClick={() => handleEdit(record)}
            style={{
              backgroundColor:
                record.status === "pending" ? "#faad14" : "#d9d9d9",
              borderColor: record.status === "pending" ? "#faad14" : "#d9d9d9",
              color: record.status === "pending" ? "white" : "#888",
              cursor: record.status === "pending" ? "pointer" : "not-allowed",
            }}
            disabled={record.status !== "pending"}
          >
            แก้ไข
          </Button>
          <Button
            size="small"
            onClick={() => handleOpenModalReturn(record)}
            style={{
              backgroundColor:
                record.status === "return" ? "#722ed1" : "#d9d9d9",
              borderColor: record.status === "return" ? "#722ed1" : "#d9d9d9",
              color: record.status === "return" ? "white" : "#888",
              cursor: record.status === "return" ? "pointer" : "not-allowed",
            }}
            disabled={record.status !== "return"}
          >
            ยืนยันรับคืน
          </Button>
          <Popover
            trigger="click"
            title={
              <Space>
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                <Typography.Text strong>ยืนยันการอนุมัติ ?</Typography.Text>
              </Space>
            }
            content={
              <Space style={{ display: "flex", marginTop: 13 }}>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleApprove(record)}
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                    color: "white",
                  }}
                >
                  อนุมัติ
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() => {
                    setSelectedRecord(record);
                    setIsModalOpen(true);
                    setPopoverOpen(false);
                    setOpenPopoverId(null);
                  }}
                >
                  ยกเลิก
                </Button>
              </Space>
            }
            open={openPopoverId === record.id}
            onOpenChange={(open) => setOpenPopoverId(open ? record.id : null)}
          >
            <Button
              size="small"
              style={{
                backgroundColor:
                  record.status === "pending" ? "#52c41a" : "#d9d9d9",
                borderColor:
                  record.status === "pending" ? "#52c41a" : "#d9d9d9",
                color: record.status === "pending" ? "white" : "#888",
                cursor: record.status === "pending" ? "pointer" : "not-allowed",
              }}
              disabled={record.status !== "pending"}
            >
              อนุมัติ
            </Button>
          </Popover>

          <Button
            type="primary"
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

  return (
    <Card
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
      bordered
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
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

      {/* Modal ยกเลิก */}
      <Modal
        title="กรอกเหตุผลการยกเลิกรายการนี้"
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
          formCancel.resetFields();
        }}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => handleCancel(values)}
        >
          <Form.Item
            name="cancelReason"
            rules={[{ required: true, message: "กรุณาระบุเหตุผลการยกเลิก" }]}
          >
            <Input.TextArea rows={3} placeholder="ระบุเหตุผลการยกเลิก" />
          </Form.Item>
        </Form>
      </Modal>

      {/* รายละเอียดเพิ่มเติม */}
      <MedicalEquipmentTableDetails
        record={recordDetails}
        open={openDetails}
        onClose={() => setOpenDetails(false)}
      />
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
          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
              <Form.Item label="สถานะ" name="status">
                <div>
                  {recordReturn?.status === "pending" && (
                    <Tag color="gold">รอดำเนินการ</Tag>
                  )}
                  {recordReturn?.status === "approve" && (
                    <Tag color="green">อนุมัติ</Tag>
                  )}
                  {recordReturn?.status === "cancel" && (
                    <Tag color="red">ยกเลิก</Tag>
                  )}
                  {recordReturn?.status === "return" && (
                    <Tag color="blue">รับคืนแล้ว</Tag>
                  )}
                  {recordReturn?.status === "verified" && (
                    <Tag color="purple">ตรวจรับคืนแล้ว</Tag>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="หมายเหตุ" name="note">
                <Input.TextArea disabled rows={3} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="ผู้รับคืน" name="returnName">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Card>
  );
}
