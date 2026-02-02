"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Input,
  Button,
  message,
  Row,
  Col,
  ConfigProvider,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import th_TH from "antd/locale/th_TH";
import {
  MaMedicalEquipmentType,
  MedicalEquipmentType,
} from "../../common/index";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { maMedicalEquipmentServices } from "../services/medicalEquipment.service";
import { buddhistLocale } from "@/app/common";

const { TextArea } = Input;
const { Text } = Typography;

interface MaMedicalEquipmentEditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  record: MaMedicalEquipmentType | null;
  dataEQ: MedicalEquipmentType[];
}

export default function MaMedicalEquipmentEditModal({
  open,
  onClose,
  onSuccess,
  record,
  dataEQ,
}: MaMedicalEquipmentEditModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const intraAuth = useAxiosAuth();
  const intraAuthService = maMedicalEquipmentServices(intraAuth);

  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedTools, setSelectedTools] = useState<any[]>([]);
  const [tempSelectedKeys, setTempSelectedKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState("");

  const stockData = useMemo(() => {
    return dataEQ.map((eq) => {
      const items = eq.items || [];

      const totalReserved = items.reduce((sum: number, item: any) => {
        const status = item.maMedicalEquipment?.status?.toLowerCase();
        if (status === "pending" || status === "approve") {
          return sum + (item.quantity || 0);
        }
        return sum;
      }, 0);

      const totalQuantity = eq.quantity || 0;
      let currentSystemRemaining = totalQuantity - totalReserved;
      if (currentSystemRemaining < 0) currentSystemRemaining = 0;

      const originalItemInThisRecord = record?.items?.find(
        (i: any) => i.medicalEquipmentId === eq.id,
      );
      const originalQty = originalItemInThisRecord?.quantity || 0;

      const maxAssignable = currentSystemRemaining + originalQty;

      return {
        ...eq,
        key: eq.id,
        currentSystemRemaining,
        originalQty,
        maxAssignable,
      };
    });
  }, [dataEQ, record]);

  const modalDataSource = stockData.filter((item) =>
    item.equipmentName?.toLowerCase().includes(searchText.toLowerCase()),
  );

  useEffect(() => {
    if (open && record) {
      form.setFieldsValue({
        sentDate: record.sentDate ? dayjs(record.sentDate) : null,
        note: record.note || "",
      });

      const initialTools = (record.items || []).map((item: any) => {
        const stockInfo = stockData.find(
          (s) => s.id === item.medicalEquipmentId,
        );
        return {
          id: item.medicalEquipmentId,
          equipmentName:
            stockInfo?.equipmentName || item.medicalEquipment?.equipmentName,
          quantityToSend: item.quantity,
          ...stockInfo,
        };
      });

      setSelectedTools(initialTools);
    } else {
      form.resetFields();
      setSelectedTools([]);
      setSearchText("");
    }
  }, [open, record, form, stockData]);

  const handleOpenSelectionModal = () => {
    setTempSelectedKeys(selectedTools.map((t) => t.id));
    setSearchText("");
    setIsSelectionModalOpen(true);
  };

  const handleModalOk = () => {
    const newSelectedTools = stockData
      .filter((item) => tempSelectedKeys.includes(item.id))
      .map((item) => {
        const existing = selectedTools.find((t) => t.id === item.id);
        return {
          ...item,
          quantityToSend: existing ? existing.quantityToSend : 0,
        };
      });

    setSelectedTools(newSelectedTools);
    setIsSelectionModalOpen(false);
  };

  const handleDeleteItem = (id: number) => {
    setSelectedTools((prev) => prev.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id: number, value: number | null) => {
    setSelectedTools((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantityToSend: value } : item,
      ),
    );
  };

  const onFinish = async (values: any) => {
    if (!record) return;

    if (selectedTools.length === 0) {
      message.warning("กรุณาเลือกเครื่องมืออย่างน้อย 1 รายการ");
      return;
    }
    const invalidItems = selectedTools.filter(
      (t) => !t.quantityToSend || t.quantityToSend <= 0,
    );
    if (invalidItems.length > 0) {
      message.warning("กรุณาระบุจำนวนให้ครบถ้วนและถูกต้อง");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        id: record.id,
        sentDate: values.sentDate?.toISOString(),
        note: values.note,
        items: selectedTools.map((eq: any) => ({
          medicalEquipmentId: eq.id,
          quantity: eq.quantityToSend,
        })),
      };

      await intraAuthService.updateMedicalEquipmentEdit(payload);

      message.success("บันทึกการแก้ไขเรียบร้อย");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("อัปเดตข้อมูลไม่สำเร็จ:", error);
      message.error("ไม่สามารถอัปเดตข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const modalColumns = [
    {
      title: "ชื่อเครื่องมือ",
      dataIndex: "equipmentName",
      render: (text: string, record: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{text}</span>
          {record.originalQty > 0 && (
            <span className="text-xs text-blue-500">
              (เดิม: {record.originalQty})
            </span>
          )}
        </div>
      ),
    },
    {
      title: "คงเหลือ",
      dataIndex: "currentSystemRemaining",
      align: "center" as const,
      width: 90,
      render: (val: number) => (
        <span
          className={`font-bold ${val > 0 ? "text-green-600" : "text-gray-400"}`}
        >
          {val}
        </span>
      ),
    },
  ];

  const mainTableColumns = [
    {
      title: "ชื่อเครื่องมือ",
      dataIndex: "equipmentName",
      key: "equipmentName",
      render: (text: string) => <span className="text-sm">{text}</span>,
    },
    {
      title: "โควตา",
      key: "maxAssignable",
      align: "center" as const,
      width: 90,
      render: (_: any, record: any) => (
        <Tag color="blue" className="mr-0">
          {record.maxAssignable}
        </Tag>
      ),
    },
    {
      title: "เบิก",
      key: "quantityToSend",
      width: 110,
      render: (_: any, record: any) => (
        <InputNumber
          min={1}
          max={record.maxAssignable}
          placeholder="0"
          className="w-full text-center"
          size="middle"
          value={record.quantityToSend}
          onChange={(val) => handleQuantityChange(record.id, val)}
          status={!record.quantityToSend ? "warning" : ""}
        />
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined style={{ fontSize: "18px" }} />}
          onClick={() => handleDeleteItem(record.id)}
        />
      ),
    },
  ];

  const inputStyle =
    "w-full h-10 sm:h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-sm";
  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300 text-sm";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      destroyOnClose
      style={{ maxWidth: "95%", padding: 0 }}
      styles={{
        content: { borderRadius: "20px", padding: "16px sm:24px" },
        header: {
          marginBottom: "16px",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "12px",
        },
      }}
      title={
        <div className="text-lg sm:text-xl font-bold text-[#0683e9] text-center w-full">
          แก้ไขการส่งเครื่องมือแพทย์
        </div>
      }
    >
      <ConfigProvider locale={th_TH}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          preserve={false}
        >
          <div className="flex flex-wrap justify-between items-center mb-4 mt-2 gap-2">
            <Text strong className="text-base text-gray-700">
              รายการเครื่องมือแพทย์ที่ส่ง
            </Text>
            <Button
              type="dashed"
              icon={<PlusOutlined style={{ fontSize: "18px" }} />}
              onClick={handleOpenSelectionModal}
              className="text-blue-600 border-blue-300 hover:bg-blue-50 rounded-xl text-sm"
            >
              เลือกเครื่องมือ
            </Button>
          </div>

          <Table
            dataSource={selectedTools}
            columns={mainTableColumns}
            pagination={false}
            locale={{ emptyText: "ยังไม่ได้เลือกเครื่องมือ" }}
            bordered
            size="small"
            rowKey="id"
            scroll={{ x: "max-content" }}
            className="mb-6 border rounded-lg overflow-hidden"
          />

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="วันที่ส่ง"
                name="sentDate"
                rules={[{ required: true, message: "กรุณาเลือกวันที่ส่ง" }]}
              >
                <DatePicker
                  locale={buddhistLocale}
                  format="D MMMM BBBB"
                  className={inputStyle}
                  placeholder="เลือกวันที่"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="หมายเหตุ" name="note">
                <TextArea
                  rows={2}
                  autoSize={{ minRows: 2, maxRows: 3 }}
                  placeholder="หมายเหตุเพิ่มเติม"
                  className={textAreaStyle}
                  maxLength={150}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button
              onClick={onClose}
              className="h-10 px-6 rounded-lg text-gray-600 hover:bg-gray-100 border-gray-300 w-full sm:w-auto"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={selectedTools.length === 0}
              className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0 w-full sm:w-auto"
            >
              บันทึก
            </Button>
          </div>
        </Form>
      </ConfigProvider>

      <Modal
        title="เลือกเครื่องมือแพทย์"
        open={isSelectionModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsSelectionModalOpen(false)}
        width={600}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        centered
        zIndex={1050}
        style={{ maxWidth: "95%" }}
      >
        <Input
          placeholder="ค้นหาชื่อ..."
          prefix={<SearchOutlined style={{ fontSize: "18px" }} />}
          className="mb-4 h-10 rounded-xl"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Table
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: tempSelectedKeys,
            onChange: (keys) => setTempSelectedKeys(keys),
            getCheckboxProps: (record) => ({
              disabled:
                record.maxAssignable <= 0 &&
                !tempSelectedKeys.includes(record.id),
            }),
          }}
          dataSource={modalDataSource}
          columns={modalColumns}
          pagination={{ pageSize: 5 }}
          size="small"
          scroll={{ y: 300, x: "max-content" }}
          rowKey="id"
        />
      </Modal>
    </Modal>
  );
}
