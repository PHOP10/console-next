import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { MaDrugType } from "../../common";

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

  // 2. Columns
  worksheet.columns = [
    { width: 6 }, // A: ลำดับ
    { width: 12 }, // B: Working Code
    { width: 25 }, // C: รายการยา
    { width: 10 }, // D: ขนาดบรรจุ
    { width: 10 }, // E: ราคา/หน่วย
    { width: 8 }, // F: คงเหลือ
    { width: 8 }, // G: จำนวนเบิก
    { width: 10 }, // H: จำนวนจ่าย
    { width: 15 }, // I: หมายเหตุ
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

  // 4. Header
  worksheet.mergeCells("A1:I1");
  const titleRow = worksheet.getCell("A1");
  titleRow.value = "ใบขอเบิกยาและเวชภัณฑ์ที่มิใช่ยา โรงพยาบาลวังเจ้า";
  titleRow.alignment = { vertical: "middle", horizontal: "center" };
  setBaseFont(titleRow, 16, true);

  worksheet.mergeCells("A2:I2");
  const subTitleRow = worksheet.getCell("A2");
  subTitleRow.value = `กลุ่มงานเภสัชกรรม ประจำปีงบประมาณ 2569`;
  subTitleRow.alignment = { vertical: "middle", horizontal: "center" };
  setBaseFont(subTitleRow, 14, true);

  worksheet.addRow([""]);

  // 5. Info Rows
  const addInfoRow = (l1: string, v1: string, l2: string, v2: string) => {
    const row = worksheet.addRow(["", l1, v1, "", "", l2, v2, "", ""]);
    setBaseFont(row, 12);

    // Formatting
    row.getCell(2).alignment = { horizontal: "right" };
    row.getCell(3).alignment = { horizontal: "left", indent: 1 };
    row.getCell(6).alignment = { horizontal: "right" };
    row.getCell(7).alignment = { horizontal: "left", indent: 1 };

    worksheet.mergeCells(`C${row.number}:E${row.number}`);
    worksheet.mergeCells(`G${row.number}:H${row.number}`);
  };

  addInfoRow(
    "เลขที่เบิก:",
    data.requestNumber || "-",
    "วันที่:",
    new Date(data.requestDate).toLocaleDateString("th-TH"),
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

  // 6. Signatures
  const signLabelRow = worksheet.addRow([
    "",
    "ลงชื่อ ........................................ ผู้ขอเบิก",
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
    `(${data.dispenserName || "........................................"})`,
    "",
    "",
    "",
  ]);

  [signLabelRow, signNameRow].forEach((row) => {
    setBaseFont(row, 12);
    row.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.mergeCells(`B${row.number}:E${row.number}`);
    worksheet.mergeCells(`F${row.number}:I${row.number}`);
  });

  worksheet.addRow([""]);

  // 7. Table Header
  const headerRow = worksheet.addRow([
    "ลำดับ",
    "Working Code",
    "รายการ",
    "ขนาดบรรจุ",
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

  // 8. Data Items (แก้ไขตรงนี้)
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
        // Group Header
        const groupRow = worksheet.addRow([groupName]);
        setBaseFont(groupRow, 12, true);
        groupRow.getCell(1).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        worksheet.mergeCells(`A${groupRow.number}:I${groupRow.number}`);
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

            // ✅ 1. ดึงราคาจาก item.price (ราคาในรายการ)
            item.price || 0,

            item.drug?.quantity || 0,
            item.quantity,
            "", // จำนวนจ่าย
            item.note || "",
          ]);

          row.eachCell((cell, colNumber) => {
            setBaseFont(cell, 12);
            setBorder(cell);

            // ✅ 2. จัดรูปแบบแต่ละคอลัมน์ให้ถูกต้อง
            if (colNumber === 3 || colNumber === 9) {
              // ชื่อยา (Col 3) และ หมายเหตุ (Col 9) -> ชิดซ้าย, ตัดคำ
              cell.alignment = { horizontal: "left", wrapText: true };
            } else if (colNumber === 5) {
              // ราคา (Col 5) -> ชิดขวา, มีทศนิยม
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
    worksheet.mergeCells(`A${emptyRow.number}:I${emptyRow.number}`);
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
