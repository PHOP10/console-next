import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { DispenseType } from "../../common"; // ✅ อย่าลืม Import Type ของ Dispense

export const exportDispenseToExcel = async (data: DispenseType) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ใบจ่ายยา");

  // ✅ 1. ตั้งค่าหน้ากระดาษ (เหมือนเดิม)
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

  // ✅ 2. ปรับความกว้างคอลัมน์ (ตัดช่องคงเหลือ/เบิกออก เพิ่มช่องรวมเงิน)
  worksheet.columns = [
    { width: 6 }, // A: ลำดับ
    { width: 12 }, // B: Working Code
    { width: 30 }, // C: รายการยา (กว้างขึ้นนิดหน่อย)
    { width: 12 }, // D: ขนาดบรรจุ
    { width: 10 }, // E: ราคา/หน่วย
    { width: 10 }, // F: จำนวนจ่าย
    { width: 12 }, // G: รวมเงิน (เพิ่มมาแทน)
    { width: 15 }, // H: หมายเหตุ
    { width: 5 }, // I: (เว้นไว้เป็นขอบขวาเล็กๆ)
  ];

  // ✅ 3. Helper Functions (เหมือนเดิม)
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

  // 4. ส่วนหัวกระดาษ (Title)
  worksheet.mergeCells("A1:I1");
  const titleRow = worksheet.getCell("A1");
  titleRow.value = "ใบรายการจ่ายยาและเวชภัณฑ์ โรงพยาบาลวังเจ้า";
  titleRow.alignment = { vertical: "middle", horizontal: "center" };
  setBaseFont(titleRow, 16, true);

  worksheet.mergeCells("A2:I2");
  const subTitleRow = worksheet.getCell("A2");
  subTitleRow.value = `กลุ่มงานเภสัชกรรม (รายการตัดสต็อก)`;
  subTitleRow.alignment = { vertical: "middle", horizontal: "center" };
  setBaseFont(subTitleRow, 14, true);

  // 5. ข้อมูลใบจ่าย (วันที่, หมายเหตุ)
  worksheet.addRow([""]);

  const addInfoRow = (l1: string, v1: string, l2: string, v2: string) => {
    // Layout: A(ว่าง) B(Label1) C-D(Value1) E(ว่าง) F(Label2) G-H(Value2)
    const row = worksheet.addRow(["", l1, v1, "", "", l2, v2, "", ""]);
    setBaseFont(row, 12);

    // Style
    row.getCell(2).alignment = { horizontal: "right" }; // Label ซ้าย
    row.getCell(3).alignment = { horizontal: "left", indent: 1 }; // Value ซ้าย
    row.getCell(6).alignment = { horizontal: "right" }; // Label ขวา
    row.getCell(7).alignment = { horizontal: "left", indent: 1 }; // Value ขวา

    // Merge
    worksheet.mergeCells(`C${row.number}:E${row.number}`);
    worksheet.mergeCells(`G${row.number}:I${row.number}`);
  };

  // ✅ แสดงวันที่จ่าย และ หมายเหตุ
  addInfoRow(
    "วันที่จ่าย:",
    data.dispenseDate
      ? new Date(data.dispenseDate).toLocaleDateString("th-TH")
      : "-",
    "ผู้รับ/หน่วยงาน:",
    data.receiverName || "-", // ถ้ามีข้อมูลผู้รับใส่ตรงนี้ ถ้าไม่มีก็ "-"
  );

  addInfoRow(
    "จำนวนรายการ:",
    data.dispenseItems ? `${data.dispenseItems.length} รายการ` : "-",
    "หมายเหตุ:",
    data.note || "-",
  );

  const totalPriceStr = data.totalPrice
    ? `${Number(data.totalPrice).toLocaleString()} บาท`
    : "-";

  // เพิ่มบรรทัดรวมเงินแยกออกมาให้ชัดเจน
  const totalRow = worksheet.addRow([
    "",
    "",
    "",
    "",
    "",
    "รวมเป็นเงิน:",
    totalPriceStr,
    "",
    "",
  ]);
  setBaseFont(totalRow, 12, true); // ตัวหนา
  totalRow.getCell(6).alignment = { horizontal: "right" };
  totalRow.getCell(7).alignment = { horizontal: "left", indent: 1 };
  worksheet.mergeCells(`G${totalRow.number}:I${totalRow.number}`);

  worksheet.addRow([""]);

  // 6. ส่วนลายเซ็น (เอาแค่ผู้จ่ายยา ไว้ฝั่งขวา)
  const signLabelRow = worksheet.addRow([
    "",
    "", // ลบผู้ขอเบิกออก
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
    // Merge ฝั่งขวา F-I
    worksheet.mergeCells(`F${row.number}:I${row.number}`);
  });

  worksheet.addRow([""]);

  // 7. หัวตาราง
  const headerRow = worksheet.addRow([
    "ลำดับ",
    "Working Code",
    "รายการยา",
    "ขนาดบรรจุ",
    "ราคา",
    "จำนวนจ่าย",
    "รวมเงิน",
    "หมายเหตุ",
    "", // col I ปล่อยว่างหรือ merge
  ]);
  // Merge col H-I สำหรับหมายเหตุให้กว้างหน่อย หรือใช้ I เป็นขอบ
  // ในที่นี้ผมให้ H เป็นหมายเหตุ แล้ว I ปล่อยทิ้งไว้

  headerRow.eachCell((cell, colNum) => {
    if (colNum <= 8) {
      // จัดการแค่ A-H
      setBaseFont(cell, 12, true);
      cell.alignment = { vertical: "middle", horizontal: "center" };
      setBorder(cell);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEEEEEE" },
      };
    }
  });

  // 8. ข้อมูลยา (Loop Items)
  if (data.dispenseItems && data.dispenseItems.length > 0) {
    let index = 1;
    const groupedItems: Record<string, any[]> = {};
    data.dispenseItems.forEach((item: any) => {
      const typeName = item.drug?.drugType?.drugType || "อื่นๆ";
      if (!groupedItems[typeName]) groupedItems[typeName] = [];
      groupedItems[typeName].push(item);
    });

    Object.keys(groupedItems)
      .sort()
      .forEach((groupName) => {
        // หัวข้อกลุ่มยา
        const groupRow = worksheet.addRow([groupName]);
        setBaseFont(groupRow, 12, true);
        worksheet.mergeCells(`A${groupRow.number}:H${groupRow.number}`); // Merge ถึง H
        groupRow.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFDDEBF7" },
        };
        setBorder(groupRow.getCell(1));

        // รายการยาในกลุ่ม
        groupedItems[groupName].forEach((item) => {
          const itemTotalPrice = (item.quantity || 0) * (item.drug?.price || 0);

          const row = worksheet.addRow([
            index++,
            item.drug?.workingCode || "-",
            item.drug?.name || "-",
            item.drug?.packagingSize || "-",
            item.drug?.price || 0,
            item.quantity || 0, // จำนวนจ่าย
            itemTotalPrice, // รวมเงิน (Qty * Price)
            item.note || "", // หมายเหตุของแต่ละรายการ
          ]);

          row.eachCell((cell, colNumber) => {
            if (colNumber <= 8) {
              setBaseFont(cell, 12);
              setBorder(cell);

              // จัด Format
              if (colNumber === 3 || colNumber === 8) {
                // ชื่อยา, หมายเหตุ ชิดซ้าย
                cell.alignment = { horizontal: "left", wrapText: true };
              } else if (colNumber === 5 || colNumber === 7) {
                // ราคา, รวมเงิน ชิดขวา
                cell.alignment = { horizontal: "right" };
                cell.numFmt = "#,##0.00"; // Format ตัวเลขทศนิยม
              } else {
                // อื่นๆ ตรงกลาง
                cell.alignment = { horizontal: "center" };
              }
            }
          });
        });
      });
  } else {
    const emptyRow = worksheet.addRow(["ไม่พบรายการยา"]);
    worksheet.mergeCells(`A${emptyRow.number}:H${emptyRow.number}`);
    emptyRow.getCell(1).alignment = { horizontal: "center" };
    setBaseFont(emptyRow, 12);
  }

  // 9. สร้างไฟล์
  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = data.dispenseDate
    ? new Date(data.dispenseDate).toISOString().split("T")[0]
    : "unknown";
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `ใบจ่ายยา_${dateStr}.xlsx`);
};
