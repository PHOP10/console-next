import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { MaDrugType } from "../../common";
import dayjs from "dayjs";
import "dayjs/locale/th";

// Helper แปลงวันที่เป็นพุทธศักราชแบบสั้น (dd/mm/bbbb)
const formatThaiDate = (dateString?: string | Date | null) => {
  if (!dateString) return "-";
  return dayjs(dateString).locale("th").format("DD/MM/BBBB");
};

export const exportMaDrugToExcel = async (data: MaDrugType) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ใบเบิกยา");

  // 1. Page Setup
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3,
    },
  };

  // 2. Columns (เพิ่มคอลัมน์ 'วันหมดอายุ' เป็นคอลัมน์ที่ 5)
  worksheet.columns = [
    { width: 6 }, // A: ลำดับ
    { width: 12 }, // B: Working Code
    { width: 25 }, // C: รายการยา
    { width: 10 }, // D: ขนาดบรรจุ
    { width: 12 }, // E: วันหมดอายุ (✅ NEW)
    { width: 10 }, // F: ราคา/หน่วย
    { width: 8 }, // G: คงเหลือ
    { width: 8 }, // H: จำนวนเบิก
    { width: 10 }, // I: จำนวนจ่าย
    { width: 15 }, // J: หมายเหตุ
  ];

  // 3. Helper Functions
  const setBaseFont = (
    target: ExcelJS.Cell | ExcelJS.Row,
    size = 12,
    bold = false,
  ) => {
    target.font = { name: "Angsana New", family: 4, size, bold };
  };

  const setBorder = (cell: ExcelJS.Cell) => {
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  };

  // 4. Header (ปรับ Merge ถึง J)
  worksheet.mergeCells("A1:J1");
  const titleRow = worksheet.getCell("A1");
  titleRow.value = "ใบขอเบิกยาและเวชภัณฑ์ที่มิใช่ยา โรงพยาบาลวังเจ้า";
  titleRow.alignment = { vertical: "middle", horizontal: "center" };
  setBaseFont(titleRow, 16, true);

  worksheet.mergeCells("A2:J2");
  const subTitleRow = worksheet.getCell("A2");
  subTitleRow.value = `กลุ่มงานเภสัชกรรม ประจำปีงบประมาณ 2569`;
  subTitleRow.alignment = { vertical: "middle", horizontal: "center" };
  setBaseFont(subTitleRow, 14, true);

  worksheet.addRow([""]);

  // 5. Info Rows (ปรับ Merge ให้สมดุลกับ 10 คอลัมน์)
  const addInfoRow = (l1: string, v1: string, l2: string, v2: string) => {
    // Array: A, B(Label1), C(Value1), D, E, F, G(Label2), H(Value2), I, J
    const row = worksheet.addRow(["", l1, v1, "", "", "", l2, v2, "", ""]);
    setBaseFont(row, 12);

    // Formatting
    row.getCell(2).alignment = { horizontal: "right" }; // Label 1
    row.getCell(3).alignment = { horizontal: "left", indent: 1 }; // Value 1
    row.getCell(7).alignment = { horizontal: "right" }; // Label 2
    row.getCell(8).alignment = { horizontal: "left", indent: 1 }; // Value 2

    // Merge Value 1 (C-F)
    worksheet.mergeCells(`C${row.number}:F${row.number}`);
    // Merge Value 2 (H-I)
    worksheet.mergeCells(`H${row.number}:I${row.number}`);
  };

  addInfoRow(
    "เลขที่เบิก:",
    data.requestNumber || "-",
    "วันที่:",
    dayjs(data.requestDate).locale("th").format("D MMMM BBBB"),
  );
  addInfoRow(
    "หน่วยเบิก:",
    data.requestUnit || "-",
    "เบิกครั้งที่:",
    data.roundNumber?.toString() || "-",
  );

  const totalPrice = data.totalPrice
    ? `${Number(data.totalPrice).toLocaleString()} บาท`
    : "-";
  const totalItems = data.quantityUsed ? `${data.quantityUsed} รายการ` : "-";

  addInfoRow("จำนวนรายการ:", totalItems, "รวมเป็นเงิน:", totalPrice);

  worksheet.addRow([""]);

  // 6. Signatures (ปรับ Merge ให้กึ่งกลาง)
  const signLabelRow = worksheet.addRow([
    "",
    "ลงชื่อ ........................................ ผู้ขอเบิก",
    "",
    "",
    "",
    "",
    "ลงชื่อ ........................................ ผู้จ่ายยา",
    "",
    "",
    "",
  ]);
  const signNameRow = worksheet.addRow([
    "",
    `(${data.requesterName || "........................................"})`,
    "",
    "",
    "",
    "",
    `(${data.dispenserName || "........................................"})`,
    "",
    "",
    "",
  ]);

  [signLabelRow, signNameRow].forEach((row) => {
    setBaseFont(row, 12);
    row.alignment = { horizontal: "center", vertical: "middle" };
    // ซ้าย B-E
    worksheet.mergeCells(`B${row.number}:E${row.number}`);
    // ขวา G-J
    worksheet.mergeCells(`G${row.number}:J${row.number}`);
  });

  worksheet.addRow([""]);

  // 7. Table Header (เพิ่ม 'วันหมดอายุ')
  const headerRow = worksheet.addRow([
    "ลำดับ",
    "Working Code",
    "รายการ",
    "ขนาดบรรจุ",
    "วันหมดอายุ",
    "ราคา",
    "คงเหลือ",
    "เบิก",
    "จ่าย",
    "หมายเหตุ",
  ]);

  headerRow.eachCell((cell) => {
    setBaseFont(cell, 12, true);
    cell.alignment = { vertical: "middle", horizontal: "center" };
    setBorder(cell);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEEEEE" },
    };
  });

  // 8. Data Items
  if (data.maDrugItems && data.maDrugItems.length > 0) {
    const groupedItems: Record<string, any[]> = {};

    data.maDrugItems.forEach((item: any) => {
      const typeName = item.drug?.drugType?.drugType || "อื่นๆ";
      if (!groupedItems[typeName]) groupedItems[typeName] = [];
      groupedItems[typeName].push(item);
    });

    let globalIndex = 1;

    Object.keys(groupedItems)
      .sort()
      .forEach((groupName) => {
        // Group Header (Merge ถึง J)
        const groupRow = worksheet.addRow([groupName]);
        setBaseFont(groupRow, 12, true);
        groupRow.getCell(1).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        worksheet.mergeCells(`A${groupRow.number}:J${groupRow.number}`);
        groupRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFDDEBF7" },
        };
        setBorder(groupRow.getCell(1));

        // Items
        groupedItems[groupName].forEach((item) => {
          const row = worksheet.addRow([
            globalIndex++,
            item.drug?.workingCode || "-",
            item.drug?.name || "-",
            item.drug?.packagingSize || "-",

            // ✅ 1. เพิ่มวันหมดอายุ
            formatThaiDate(item.expiryDate),

            item.price || 0, // ราคา
            item.drug?.quantity || 0, // คงเหลือ
            item.quantity, // เบิก
            "", // จำนวนจ่าย (เว้นว่างไว้)
            item.note || "",
          ]);

          row.eachCell((cell, colNumber) => {
            setBaseFont(cell, 12);
            setBorder(cell);

            // จัดรูปแบบ
            if (colNumber === 3 || colNumber === 10) {
              // ชื่อยา(3) และ หมายเหตุ(10) -> ชิดซ้าย
              cell.alignment = { horizontal: "left", wrapText: true };
            } else if (colNumber === 6) {
              // ราคา(6) -> ชิดขวา
              cell.alignment = { horizontal: "right" };
              cell.numFmt = "#,##0.00";
            } else {
              // อื่นๆ -> ตรงกลาง
              cell.alignment = { horizontal: "center" };
            }
          });
        });
      });
  } else {
    const emptyRow = worksheet.addRow(["ไม่พบรายการยา"]);
    worksheet.mergeCells(`A${emptyRow.number}:J${emptyRow.number}`);
    emptyRow.getCell(1).alignment = { horizontal: "center" };
    setBaseFont(emptyRow, 12);
  }

  // 9. Save File
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `ใบเบิกยา_${data.requestNumber}.xlsx`);
};
