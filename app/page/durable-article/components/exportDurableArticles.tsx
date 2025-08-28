// lib/exportDurableArticle.ts
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export interface DurableArticleType {
  id: number;
  code: string;
  acquiredDate: string | Date;
  description: string;
  unitPrice: number;
  acquisitionType: string;
  usageLifespanYears: number;
  monthlyDepreciation: number;
  yearlyDepreciation?: number;
  accumulatedDepreciation?: number;
  netValue?: number;
  note?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export function exportDurableArticles(data: DurableArticleType[]) {
  // map ข้อมูลเป็น header ภาษาไทย
  const exportData = data.map((item) => ({
    รหัส: item.code,
    วันที่ได้มา: item.acquiredDate
      ? new Date(item.acquiredDate).toLocaleDateString("th-TH")
      : "-",
    รายละเอียด: item.description,
    ราคาต่อหน่วย: item.unitPrice,
    ประเภทการได้มา: item.acquisitionType,
    "อายุการใช้งาน (ปี)": item.usageLifespanYears,
    "ค่าเสื่อม/เดือน": item.monthlyDepreciation,
    "ค่าเสื่อม/ปี": item.yearlyDepreciation ?? "-",
    ค่าเสื่อมสะสม: item.accumulatedDepreciation ?? "-",
    มูลค่าสุทธิ: item.netValue ?? "-",
    หมายเหตุ: item.note ?? "-",
    ผู้สร้าง: "-", // ถ้ามีข้อมูล createdBy สามารถใส่
    สร้างเมื่อ: item.createdAt
      ? new Date(item.createdAt).toLocaleString("th-TH")
      : "-",
    อัปเดตเมื่อ: item.updatedAt
      ? new Date(item.updatedAt).toLocaleString("th-TH")
      : "-",
  }));

  const worksheet = XLSX.utils.json_to_sheet([]);

  // ใส่ title ไว้ A1
  XLSX.utils.sheet_add_aoa(worksheet, [["รายการครุภัณฑ์ทั้งหมด"]], {
    origin: "A1",
  });

  // เติมข้อมูลเริ่มที่ A2
  XLSX.utils.sheet_add_json(worksheet, exportData, { origin: "A2" });

  // merge title cell
  const colCount = Object.keys(exportData[0] || {}).length;
  worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }];

  // style title
  if (worksheet["A1"]) {
    worksheet["A1"].s = {
      alignment: { horizontal: "center", vertical: "center" },
      font: { bold: true, sz: 14 },
    };
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ครุภัณฑ์");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true,
  });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, "DurableArticles.xlsx");
}
