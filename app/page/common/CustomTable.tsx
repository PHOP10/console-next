"use client";

import { Table, TableProps } from "antd";

// รับ Props ทุกอย่างที่ Antd Table รับได้
interface CustomTableProps<T> extends TableProps<T> {
  // คุณอาจจะเพิ่ม prop พิเศษตรงนี้ได้ถ้าต้องการ
}

export default function CustomTable<T extends object>(
  props: CustomTableProps<T>,
) {
  return (
    // ย้าย Div ที่ทำเงาและขอบโค้งมาไว้ที่นี่ทีเดียว
<div className="bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
      <Table<T>
        {...props}
        className={`
          ${props.className || ""} 
          [&_.ant-table-container]:!rounded-xl
          [&_.ant-table]:!border-separate
          [&_.ant-table]:!border-spacing-0

          /* --- ส่วนหัวตาราง (Header) --- */
          [&_.ant-table-thead_th]:!bg-[#eaf4ff]
          [&_.ant-table-thead_th]:!text-[#0683e9]
          [&_.ant-table-thead_th]:!font-bold
          
          /* --- เส้นขอบ (Grid Lines) --- */
          /* 1. กำหนดให้ทุกช่องมีเส้นขอบขวาและล่าง สีเทาอ่อน */
          [&_.ant-table-cell]:!border-r
          [&_.ant-table-cell]:!border-b
          [&_.ant-table-cell]:!border-[#e2e8f0] 

          /* 2. ลบเส้นขอบขวาสุดออก (ไม่ให้ซ้อนกับกรอบ) */
          [&_.ant-table-cell:last-child]:!border-r-0

          /* 3. ลบเส้นขอบล่างสุดของแถวสุดท้ายออก (เพื่อให้มุมโค้งทำงานได้สวย) */
          [&_.ant-table-tbody_tr:last-child_td]:!border-b-0

          /* --- มุมโค้ง (Rounded Corners) --- */
          [&_.ant-table-thead_th:first-child]:!rounded-tl-xl
          [&_.ant-table-thead_th:last-child]:!rounded-tr-xl
          [&_.ant-table-tbody_tr:last-child_td:first-child]:!rounded-bl-xl
          [&_.ant-table-tbody_tr:last-child_td:last-child]:!rounded-br-xl

          /* --- Hover Effect --- */
          [&_.ant-table-row:hover>*]:!bg-[#f0f7ff]
          [&_.ant-table-row]:transition-colors
        `}
      />
    </div>
  );
}
