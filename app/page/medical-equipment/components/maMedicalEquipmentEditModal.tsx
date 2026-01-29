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

  // State สำหรับ Modal เลือกของ และ รายการที่เลือก
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedTools, setSelectedTools] = useState<any[]>([]); // รายการในตารางหลัก
  const [tempSelectedKeys, setTempSelectedKeys] = useState<React.Key[]>([]); // รายการที่ติ๊กใน Modal
  const [searchText, setSearchText] = useState("");

  // ---------------------------------------------------------------------------
  // 1. Logic คำนวณสต็อก (Custom for Edit Mode)
  // ---------------------------------------------------------------------------
  const stockData = useMemo(() => {
    return dataEQ.map((eq) => {
      const items = eq.items || [];

      // 1.1 คำนวณยอดที่ถูกจองทั้งหมดในระบบ (รวมถึงใบงานนี้ด้วย เพราะข้อมูลมาจาก DB)
      const totalReserved = items.reduce((sum: number, item: any) => {
        const status = item.maMedicalEquipment?.status?.toLowerCase();
        if (status === "pending" || status === "approve") {
          return sum + (item.quantity || 0);
        }
        return sum;
      }, 0);

      // 1.2 คงเหลือจริงในระบบ (Realtime)
      const totalQuantity = eq.quantity || 0;
      let currentSystemRemaining = totalQuantity - totalReserved;
      if (currentSystemRemaining < 0) currentSystemRemaining = 0;

      // 1.3 หาว่า "ใบงานนี้" (record ปัจจุบัน) จองไปเท่าไหร่ (Original Quantity)
      // เพื่อนำมาบวกกลับ เป็น "โควตาสูงสุดที่ใบงานนี้ใช้ได้"
      const originalItemInThisRecord = record?.items?.find(
        (i: any) => i.medicalEquipmentId === eq.id,
      );
      const originalQty = originalItemInThisRecord?.quantity || 0;

      // 1.4 Max Limit สำหรับการแก้ไขครั้งนี้
      // = ของที่เหลือให้คนอื่นแย่ง + ของที่ฉันถืออยู่เดิม
      const maxAssignable = currentSystemRemaining + originalQty;

      return {
        ...eq,
        key: eq.id,
        currentSystemRemaining, // คงเหลือให้คนอื่นเห็น
        originalQty, // ที่ฉันจองไว้
        maxAssignable, // เพดานที่ฉันกรอกได้
      };
    });
  }, [dataEQ, record]);

  // กรองข้อมูลใน Modal ตาม Search Text
  const modalDataSource = stockData.filter((item) =>
    item.equipmentName?.toLowerCase().includes(searchText.toLowerCase()),
  );

  // ---------------------------------------------------------------------------
  // 2. Initialization (โหลดข้อมูลเมื่อเปิด Modal)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (open && record) {
      // Set Form Fields ทั่วไป
      form.setFieldsValue({
        sentDate: record.sentDate ? dayjs(record.sentDate) : null,
        note: record.note || "",
      });

      // Map Items เดิม เข้าสู่ State selectedTools
      // ต้อง map กับ stockData เพื่อเอาค่า maxAssignable มาด้วย
      const initialTools = (record.items || []).map((item: any) => {
        const stockInfo = stockData.find(
          (s) => s.id === item.medicalEquipmentId,
        );
        return {
          id: item.medicalEquipmentId,
          equipmentName:
            stockInfo?.equipmentName || item.medicalEquipment?.equipmentName, // กันเหนียวถ้าหา stockData ไม่เจอ
          quantityToSend: item.quantity,
          ...stockInfo, // spread ค่า maxAssignable, remaining มาใส่
        };
      });

      setSelectedTools(initialTools);
    } else {
      form.resetFields();
      setSelectedTools([]);
      setSearchText("");
    }
  }, [open, record, form, stockData]); // เพิ่ม stockData ใน dependency เพื่อให้ค่า update ทันที

  // ---------------------------------------------------------------------------
  // 3. Handlers
  // ---------------------------------------------------------------------------

  const handleOpenSelectionModal = () => {
    // Pre-select รายการที่มีอยู่แล้ว
    setTempSelectedKeys(selectedTools.map((t) => t.id));
    setSearchText("");
    setIsSelectionModalOpen(true);
  };

  const handleModalOk = () => {
    // สร้างรายการใหม่จาก Keys ที่เลือก
    const newSelectedTools = stockData
      .filter((item) => tempSelectedKeys.includes(item.id))
      .map((item) => {
        // ถ้าเป็นรายการเดิม ให้คงค่าจำนวนที่กรอกไว้ (quantityToSend)
        const existing = selectedTools.find((t) => t.id === item.id);
        return {
          ...item,
          quantityToSend: existing ? existing.quantityToSend : 0, // ถ้าเพิ่งเลือกใหม่ ให้เป็น 0 หรือ undefined
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

    // Validation
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

  // ---------------------------------------------------------------------------
  // 4. Columns Configuration
  // ---------------------------------------------------------------------------

  // Columns ตารางเลือกของ (Modal)
  const modalColumns = [
    {
      title: "ชื่อเครื่องมือ",
      dataIndex: "equipmentName",
      render: (text: string, record: any) => (
        <div className="flex flex-col">
          <span>{text}</span>
          {record.originalQty > 0 && (
            <span className="text-xs text-blue-500">
              (อยู่ในใบงานนี้: {record.originalQty})
            </span>
          )}
        </div>
      ),
    },
    {
      title: "คงเหลือในคลัง",
      dataIndex: "currentSystemRemaining",
      align: "center" as const,
      width: 120,
      render: (val: number) => (
        <span
          className={val > 0 ? "text-green-600 font-bold" : "text-gray-400"}
        >
          {val}
        </span>
      ),
    },
  ];

  // Columns ตารางหลัก (Main Form)
  const mainTableColumns = [
    {
      title: "ชื่อเครื่องมือ",
      dataIndex: "equipmentName",
      key: "equipmentName",
    },
    {
      title: "โควตาสูงสุด",
      key: "maxAssignable",
      align: "center" as const,
      width: 120,
      render: (_: any, record: any) => (
        // แสดงให้ User รู้ว่าแก้ได้สูงสุดเท่าไหร่ (คงเหลือ + ของเดิมที่ตัวเองถือ)
        <Tag color="blue">{record.maxAssignable}</Tag>
      ),
    },
    {
      title: "จำนวนที่เบิก",
      key: "quantityToSend",
      width: 150,
      render: (_: any, record: any) => (
        <InputNumber
          min={1}
          max={record.maxAssignable} // **สำคัญ: ห้ามกรอกเกินโควตา**
          placeholder="จำนวน"
          className="w-full"
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
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem(record.id)}
        />
      ),
    },
  ];

  // --- Style Constants ---
  const inputStyle =
    "w-full h-11 rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";
  const textAreaStyle =
    "w-full rounded-xl border-gray-300 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:shadow-md transition-all duration-300";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      destroyOnClose
      styles={{
        content: { borderRadius: "20px", padding: "24px" },
        header: {
          marginBottom: "16px",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "12px",
        },
      }}
      title={
        <div className="text-xl font-bold text-[#0683e9] text-center w-full">
          แก้ไขข้อมูลการเบิกเครื่องมือแพทย์
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
          {/* ส่วนหัวตาราง + ปุ่มกดเลือก */}
          <div className="flex justify-between items-center mb-4 mt-2">
            <Text strong className="text-base text-gray-700">
              <ToolOutlined className="mr-2" /> รายการเครื่องมือที่เบิก
            </Text>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleOpenSelectionModal}
              className="text-blue-600 border-blue-300 hover:bg-blue-50 rounded-xl"
            >
              เลือกเครื่องมือแก้ไข
            </Button>
          </div>

          {/* ตารางหลัก */}
          <Table
            dataSource={selectedTools}
            columns={mainTableColumns}
            pagination={false}
            locale={{ emptyText: "ยังไม่ได้เลือกเครื่องมือ" }}
            bordered
            size="middle"
            rowKey="id"
            className="mb-6 border rounded-lg overflow-hidden"
          />

          {/* วันที่และหมายเหตุ */}
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="วันที่ส่ง"
                name="sentDate"
                rules={[{ required: true, message: "กรุณาเลือกวันที่ส่ง" }]}
              >
                <DatePicker
                  format="D MMMM BBBB"
                  className={inputStyle}
                  placeholder="เลือกวันที่"
                />
              </Form.Item>
            </Col>
            <Col span={12}>{/* Placeholder col */}</Col>
          </Row>

          <Form.Item label="หมายเหตุ" name="note">
            <TextArea
              rows={3}
              placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
              className={textAreaStyle}
            />
          </Form.Item>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              onClick={onClose}
              className="h-10 px-6 rounded-lg text-gray-600 hover:bg-gray-100 border-gray-300"
            >
              ยกเลิก
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={selectedTools.length === 0}
              className="h-10 px-6 rounded-lg shadow-md bg-[#0683e9] hover:bg-blue-600 border-0"
            >
              บันทึกการแก้ไข
            </Button>
          </div>
        </Form>
      </ConfigProvider>

      {/* --- MODAL เลือกเครื่องมือ (ซ้อน) --- */}
      <Modal
        title="เลือกเครื่องมือแพทย์"
        open={isSelectionModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsSelectionModalOpen(false)}
        width={600}
        okText="ยืนยันการเลือก"
        cancelText="ยกเลิก"
        centered
        zIndex={1050} // ต้องสูงกว่า Modal หลัก
      >
        <Input
          placeholder="ค้นหาชื่อเครื่องมือ..."
          prefix={<SearchOutlined />}
          className="mb-4 h-10 rounded-xl"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Table
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: tempSelectedKeys,
            onChange: (keys) => setTempSelectedKeys(keys),
            // disable ถ้าโควตาเต็ม (maxAssignable <= 0) และยังไม่ได้เลือก
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
          scroll={{ y: 300 }}
          rowKey="id"
        />
      </Modal>
    </Modal>
  );
}
