"use client";

import React, { useMemo, useState } from "react";
import { Modal, Input, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { DrugType, MasterDrugType } from "../../common"; // ⚠️ เช็ค path ให้ตรงกับของลูกพี่นะครับ
import CustomTable from "../../common/CustomTable";

interface DrugSelectModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onOk: (selectedDrugs: DrugType[]) => void;
  drugs: DrugType[];
  masterDrugs: MasterDrugType[]; // ✅ รับประเภทยามาเพื่อใช้ค้นหา
  existingDrugIds: number[]; // ✅ รับ ID ยาที่มีอยู่แล้วในตาราง เพื่อไม่ให้เลือกซ้ำ
  disableZeroStock?: boolean;
}

export default function DrugSelectModal({
  isOpen,
  onCancel,
  onOk,
  drugs,
  masterDrugs,
  existingDrugIds,
  disableZeroStock = false,
}: DrugSelectModalProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // ✅ เคลียร์ค่าเวลากดเปิด Modal ใหม่
  React.useEffect(() => {
    if (isOpen) {
      setSearchText("");
      setSelectedType(null);
      setSelectedRowKeys([]);
    }
  }, [isOpen]);

  // ✅ กรองข้อมูลยา
  const filteredDrugs = useMemo(() => {
    return drugs.filter((d) => {
      // 1. กรองยาที่ถูกเลือกไปแล้วในตารางหลักออก (เพื่อไม่ให้เบิกยาซ้ำซ้อน)
      if (existingDrugIds.includes(d.id)) return false;

      // 2. กรองตามประเภทยา
      if (selectedType && d.drugTypeId !== selectedType) return false;

      // 3. กรองตาม Text (ชื่อ หรือ รหัส)
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        return (
          d.name.toLowerCase().includes(searchLower) ||
          d.workingCode.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [drugs, searchText, selectedType, existingDrugIds]);

  const handleOk = () => {
    // หาข้อมูลยาทั้งหมดที่ถูกเลือก
    const selectedDrugsData = drugs.filter((d) =>
      selectedRowKeys.includes(d.id),
    );
    onOk(selectedDrugsData);
  };

  const columns: ColumnsType<DrugType> = [
    {
      title: "รหัสยา",
      dataIndex: "workingCode",
      width: 100,
    },
    {
      title: "ชื่อยา",
      dataIndex: "name",
      render: (text: string) => (
        <span className="font-medium text-sm">{text}</span>
      ),
    },
    {
      title: "ประเภทยา",
      dataIndex: "drugTypeId",
      width: 150,
      render: (id) => {
        const type = masterDrugs.find((m) => m.drugTypeId === id);
        return type ? type.drugType : "-";
      },
    },
    {
      title: "ราคา",
      dataIndex: "price",
      width: 80,
      align: "right",
      render: (val: number) => val?.toLocaleString() || "0",
    },
    {
      title: "คงเหลือ",
      dataIndex: "quantity",
      width: 100,
      align: "center",
      render: (val: number) => (
        <span
          className={`font-bold text-sm ${
            val <= 0 ? "text-red-500" : "text-green-600"
          }`}
        >
          {val || 0}
        </span>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="text-xl font-bold text-[#0683e9] border-b pb-3 mb-2">
          เลือกรายการยาจากคลัง
        </div>
      }
      open={isOpen}
      onOk={handleOk}
      onCancel={onCancel}
      width="80vw"
      style={{ top: 20, maxWidth: "1200px" }}
      okText={`เพิ่มรายการที่เลือก (${selectedRowKeys.length})`}
      cancelText="ยกเลิก"
      okButtonProps={{ disabled: selectedRowKeys.length === 0 }}
      destroyOnClose
      centered
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <Input
          placeholder="ค้นหาชื่อยา หรือรหัสยา..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className="w-full sm:w-1/2 h-11 rounded-lg"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />

        <Select
          placeholder="-- ทุกประเภทยา --"
          className="w-full sm:w-1/2 h-11 [&>.ant-select-selector]:!rounded-lg"
          value={selectedType}
          onChange={(val) => setSelectedType(val)}
          allowClear
          showSearch
          optionFilterProp="label"
          options={masterDrugs.map((m) => ({
            label: m.drugType,
            value: m.drugTypeId,
          }))}
        />
      </div>
      <CustomTable
        columns={columns}
        dataSource={filteredDrugs}
        rowKey="id"
        size="small"
        scroll={{ y: 400, x: "max-content" }}
        pagination={{
          pageSizeOptions: ["20", "50", "100"],
          showSizeChanger: true,
          defaultPageSize: 20,
          size: "small",

          showTotal: (total, range) => (
            <span className="text-gray-500 text-xs sm:text-sm font-light">
              แสดง {range[0]}-{range[1]} จากทั้งหมด{" "}
              <span className="font-bold text-blue-600">{total}</span> รายการ
            </span>
          ),

          locale: { items_per_page: "/ หน้า" },
          position: ["bottomRight"],
        }}
        rowSelection={{
          type: "checkbox",
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
          getCheckboxProps: (record) => ({
            disabled: disableZeroStock ? record.quantity <= 0 : false,
          }),
        }}
      />
      ห
    </Modal>
  );
}
