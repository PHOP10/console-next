// lib/exportDurableArticle.ts
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

export interface DurableArticleType {
  // ... (Interface เดิมของคุณ)
  id: number;
  code: string;
  registrationNumber?: string | null;
  acquiredDate: string | Date;
  description: string;
  unitPrice: number;
  acquisitionType: string;
  usageLifespanYears: number;
  monthlyDepreciation: number;
  yearlyDepreciation?: number | null;
  accumulatedDepreciation?: number | null;
  netValue?: number | null;
  category?: string | null;
  documentId?: string | null;
  responsibleAgency?: string | null;
  note?: string | null;
  location?: string | null;
  createdName?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export async function exportDurableArticles(data: DurableArticleType[]) {
  // 1. สร้าง Workbook และ Worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ข้อมูลครุภัณฑ์", {
    pageSetup: {
      paperSize: 9, // 9 = A4
      orientation: "landscape", // แนวนอน (ชัวร์ 100% กับ ExcelJS)
      fitToPage: true, // บีบให้พอดีหน้า
      fitToWidth: 1, // บีบความกว้างให้ลง 1 หน้า
      fitToHeight: 0, // ความสูงปล่อยไหลตามข้อมูล
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3,
      },
    },
  });

  // 2. กำหนดคอลัมน์และความกว้าง
  worksheet.columns = [
    { key: "index", width: 8 }, // ลำดับ
    { key: "date", width: 14 }, // วันที่
    { key: "code", width: 22 }, // รหัส
    { key: "desc", width: 50 }, // รายการ
    { key: "price", width: 15 }, // ราคา
    { key: "type", width: 25 }, // วิธีได้มา
    { key: "note", width: 25 }, // หมายเหตุ
  ];

  // 3. เตรียม Style มาตรฐาน (TH Sarabun New 16)
  const baseFont = { name: "TH Sarabun New", size: 16 };
  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  // 4. ส่วนหัวเรื่องใหญ่ (Row 1)
  worksheet.mergeCells("A1:G1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value =
    "จำนวนครุภัณฑ์ ทั้งหมดของ โรงพยาบาลส่งเสริมสุขภาพตำบลบ้านผาผึ้ง";
  titleCell.font = { name: "TH Sarabun New", size: 16, bold: true };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  // 5. ส่วนหัวตาราง (Row 2)
  const headerRow = worksheet.addRow([
    "ลำดับ",
    "วัน เดือน ปี",
    "เลขที่หรือรหัส",
    "ชื่อ ชนิด แบบ ขนาดและลักษณะ",
    "ราคาต่อหน่วย",
    "วิธีการได้มา",
    "หมายเหตุ",
  ]);

  // จัด Style หัวตาราง
  headerRow.eachCell((cell) => {
    cell.font = { name: "TH Sarabun New", size: 16, bold: true };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = borderStyle;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF0F0F0" }, // สีเทาอ่อน
    };
  });

  // 6. ใส่ข้อมูล (Data Rows)
  data.forEach((item, index) => {
    let dateStr = "-";
    if (item.acquiredDate) {
      const d = dayjs(item.acquiredDate);
      // แก้ไขตรงนี้ครับ: ใช้ format "D MMM" แล้วต่อด้วยปี พ.ศ.
      // ผลลัพธ์: "1 ม.ค. 2569", "15 เม.ย. 2568"
      dateStr = `${d.format("D MMM")} ${d.year() + 543}`;
    }

    const row = worksheet.addRow([
      index + 1, // ลำดับ
      dateStr, // วันที่ (รูปแบบใหม่)
      item.code, // รหัส
      item.description, // รายการ
      item.unitPrice, // ราคา
      item.acquisitionType, // วิธีได้มา
      item.note || "-", // หมายเหตุ
    ]);

    // จัด Style ข้อมูลแต่ละช่อง
    row.eachCell((cell, colNumber) => {
      cell.font = baseFont;
      cell.border = borderStyle;
      cell.alignment = {
        vertical: "top", // ชิดบน
        wrapText: true, // ตัดคำ
        horizontal: "center", // ค่า Default กึ่งกลาง
      };

      // จัดซ้าย/ขวา เฉพาะคอลัมน์
      if (colNumber === 4 || colNumber === 7) {
        // รายการ (4) และ หมายเหตุ (7) -> ชิดซ้าย
        cell.alignment.horizontal = "left";
      } else if (colNumber === 5) {
        // ราคา (5) -> ชิดขวา + ใส่ลูกน้ำ
        cell.alignment.horizontal = "right";
        cell.numFmt = "#,##0.00";
      }
    });
  });

  // 7. สร้าง Buffer และ Save ไฟล์
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // สร้างวันที่ปัจจุบัน
  const d = dayjs();

  // จัดรูปแบบเป็น "18 ก.พ. 2569" (D MMM YYYY+543)
  const dateStr = `${d.format("D MMM")} ${d.year() + 543}`;

  // ชื่อไฟล์จะเป็น: "รายงานครุภัณฑ์_18 ก.พ. 2569.xlsx"
  const fileName = `รายงานครุภัณฑ์_${dateStr}.xlsx`;

  saveAs(blob, fileName);
}
