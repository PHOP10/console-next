// lib/exportDurableArticle.ts
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import "dayjs/locale/th"; // Import locale ภาษาไทยสำหรับ dayjs

// ตั้งค่า dayjs เป็นภาษาไทย
dayjs.locale("th");

// อัปเดต Interface ให้ตรงกับ Prisma Model ที่มีฟิลด์ครบถ้วน
export interface DurableArticleType {
  id: number;
  code: string;
  registrationNumber?: string | null; // เลขทะเบียน
  acquiredDate: string | Date;
  description: string;
  unitPrice: number;
  acquisitionType: string;
  usageLifespanYears: number;
  monthlyDepreciation: number;
  yearlyDepreciation?: number | null;
  accumulatedDepreciation?: number | null;
  netValue?: number | null;

  category?: string | null; // หมวดหมู่
  documentId?: string | null; // เลขที่เอกสาร
  responsibleAgency?: string | null; // หน่วยงาน
  note?: string | null;
  createdName?: string | null; // ผู้บันทึก
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export function exportDurableArticles(data: DurableArticleType[]) {
  // 1. เตรียมข้อมูล (Mapping)
  // จัดเรียงลำดับคอลัมน์ใหม่ให้อ่านง่าย: รหัส -> รายละเอียด -> หน่วยงาน -> ราคา -> ค่าเสื่อม
  const exportData = data.map((item, index) => {
    const acquireDateObj = item.acquiredDate ? dayjs(item.acquiredDate) : null;

    return {
      ลำดับ: index + 1,
      รหัสครุภัณฑ์: item.code,
      เลขทะเบียน: item.registrationNumber || "-",
      เลขที่เอกสาร: item.documentId || "-",
      "รายการ/รายละเอียด": item.description,
      หมวดหมู่: item.category || "-",
      หน่วยงานที่รับผิดชอบ: item.responsibleAgency || "-",
      วันที่ได้รับ: acquireDateObj ? acquireDateObj.format("DD/MM/YYYY") : "-",
      วิธีการได้มา: item.acquisitionType,
      "ราคาต่อหน่วย (บาท)": item.unitPrice, // ส่งเป็น number เพื่อให้ Excel คำนวณต่อได้
      "อายุการใช้งาน (ปี)": item.usageLifespanYears,
      "ค่าเสื่อม/เดือน (บาท)": item.monthlyDepreciation,
      "ค่าเสื่อม/ปี (บาท)": item.yearlyDepreciation || 0,
      "ค่าเสื่อมสะสม (บาท)": item.accumulatedDepreciation || 0,
      "มูลค่าสุทธิ (บาท)": item.netValue || 0,
      หมายเหตุ: item.note || "-",
      ผู้บันทึก: item.createdName || "-",
      วันที่บันทึก: item.createdAt
        ? dayjs(item.createdAt).format("DD/MM/YYYY")
        : "-",
    };
  });

  // 2. สร้าง Worksheet
  // ใช้ sheet_add_json โดยเริ่มที่บรรทัด A2 (เว้น A1 ไว้ใส่หัวเรื่อง)
  const worksheet = XLSX.utils.json_to_sheet(exportData, {
    origin: "A2",
  } as any);

  // 3. กำหนดความกว้างคอลัมน์ (Widths)
  // wch คือหน่วยจำนวนตัวอักษรโดยประมาณ
  worksheet["!cols"] = [
    { wch: 5 }, // ลำดับ
    { wch: 20 }, // รหัสครุภัณฑ์
    { wch: 15 }, // เลขทะเบียน
    { wch: 15 }, // เลขที่เอกสาร
    { wch: 40 }, // รายละเอียด (กว้างหน่อย)
    { wch: 18 }, // หมวดหมู่
    { wch: 20 }, // หน่วยงาน
    { wch: 11 }, // วันที่ได้รับ
    { wch: 15 }, // วิธีการได้มา
    { wch: 15 }, // ราคา
    { wch: 12 }, // อายุใช้งาน
    { wch: 15 }, // ค่าเสื่อมเดือน
    { wch: 15 }, // ค่าเสื่อมปี
    { wch: 15 }, // ค่าเสื่อมสะสม
    { wch: 15 }, // มูลค่าสุทธิ
    { wch: 20 }, // หมายเหตุ
    { wch: 15 }, // ผู้บันทึก
    { wch: 11 }, // วันที่บันทึก
  ];

  // 4. ใส่หัวเรื่องใหญ่ (Main Title) ที่ A1
  XLSX.utils.sheet_add_aoa(worksheet, [["รายงานข้อมูลครุภัณฑ์ทั้งหมด"]], {
    origin: "A1",
  });

  // Merge Cell หัวเรื่อง (A1 ถึง Column สุดท้าย)
  const colCount = Object.keys(exportData[0] || {}).length;
  worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }];

  // *หมายเหตุ: การใส่ Style (.s) ใน SheetJS รุ่น Community (ฟรี) จะไม่แสดงผลในไฟล์ Output
  // แต่ถ้าคุณใช้รุ่น Pro หรือ wrapper เช่น xlsx-js-style โค้ดด้านล่างนี้จะทำงาน
  if (worksheet["A1"]) {
    worksheet["A1"].s = {
      font: { name: "Sarabun", sz: 16, bold: true },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // 5. สร้าง Workbook และ Export
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ข้อมูลครุภัณฑ์");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  // ตั้งชื่อไฟล์พร้อมวันที่ปัจจุบัน เช่น "ข้อมูลครุภัณฑ์_25-10-2023.xlsx"
  const fileName = `ข้อมูลครุภัณฑ์_${dayjs().format("DD-MM-YYYY")}.xlsx`;

  saveAs(blob, fileName);
}
