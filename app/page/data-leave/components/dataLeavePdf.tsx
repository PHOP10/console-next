"use client";

import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { Tooltip, message } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/th";
import Holidays from "date-holidays";

// ✅ Import ไลบรารีสำหรับเจาะรูเติมคำ
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// ✅ Import Service ของคุณ
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveService } from "../services/dataLeave.service";
import { userService } from "../../user/services/user.service";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";

dayjs.locale("th");
const hd = new Holidays("TH");

interface Props {
  record: any;
}

const DataLeavePdf: React.FC<Props> = ({ record }) => {
  const intraAuth = useAxiosAuth();
  const intraAuthDataLeaveService = DataLeaveService(intraAuth);
  const intraAuthUserService = userService(intraAuth);

  const [userData, setUserData] = useState<UserType[]>([]);
  const [masterLeave, setMasterLeave] = useState<MasterLeaveType[]>([]);
  const [dataLeaveUser, setDataLeaveUser] = useState<DataLeaveType[]>([]);

  // (ซ่อนโค้ด fetchData และฟังก์ชันคำนวณวันลาไว้เหมือนเดิม เพื่อไม่ให้ยาวเกินไป คุณใช้ของเดิมที่มีอยู่ได้เลยครับ)
  const fetchData = async () => {
    /* โค้ดเดิมของคุณ */
    try {
      const res = await intraAuthUserService.getUserQuery();
      const dataMasterLeaves =
        await intraAuthDataLeaveService.getMasterLeaveQuery();
      const dataLeaveUser =
        await intraAuthDataLeaveService.getDataLeaveByUserId(
          record.createdById,
        );
      setUserData(res);
      setMasterLeave(dataMasterLeaves);
      setDataLeaveUser(dataLeaveUser);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (record.createdById) fetchData();
  }, [record]);

  const toThaiNumber = (input: string | number | undefined | null): string => {
    if (input === undefined || input === null || input === "") return "";
    const thaiDigits = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
    return input
      .toString()
      .replace(/[0-9]/g, (digit) => thaiDigits[parseInt(digit)]);
  };

  const formatThaiDate = (date: string | Date | undefined) => {
    if (!date) return "";
    const d = dayjs(date);
    return `${toThaiNumber(d.format("D"))} ${d.format("MMMM")} ${toThaiNumber(d.year() + 543)}`;
  };

  const isHoliday = (date: dayjs.Dayjs) => {
    const holiday = hd.isHoliday(date.toDate());
    return holiday && holiday[0].type === "public";
  };

  const calculateDays = (start: string | Date, end: string | Date) => {
    if (!start || !end) return 0;
    const startDate = dayjs(start).startOf("day");
    const endDate = dayjs(end).endOf("day");
    if (endDate.isBefore(startDate)) return 0;

    let count = 0;
    let current = startDate;
    while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
      const dayOfWeek = current.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (!isWeekend && !isHoliday(current)) {
        count++;
      }
      current = current.add(1, "day");
    }
    return count;
  };

  const getLeaveStats = (leaveTypeName: string) => {
    const leave = masterLeave.find((l) => l.leaveType === leaveTypeName);
    if (!leave) return { usedDays: 0, currentDays: 0, totalDays: 0 };

    const usedDays = dataLeaveUser
      .filter(
        (item) =>
          item.typeId === leave.id &&
          item.status === "approve" &&
          item.id !== record.id,
      )
      .reduce(
        (sum, item) => sum + calculateDays(item.dateStart, item.dateEnd),
        0,
      );

    const currentDays =
      record.typeId === leave.id
        ? calculateDays(record.dateStart, record.dateEnd)
        : 0;
    return { usedDays, currentDays, totalDays: usedDays + currentDays };
  };

  // 🚀 ฟังก์ชันหลัก: โหลด PDF เปล่า -> ฝังฟอนต์ -> พิมพ์ข้อความทับ
  const handleExportPdf = async () => {
    message.loading({ content: "กำลังโหลด PDF...", key: "export" });

    try {
      // 1. โหลดไฟล์ PDF ฟอร์มเปล่าของคุณจากโฟลเดอร์ public
      const pdfUrl = "/dataLeaveTemplatePdf.pdf"; // เปลี่ยนชื่อให้ตรงกับไฟล์ของคุณ
      const pdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());

      // 2. โหลดไฟล์ฟอนต์ TH Sarabun New ของแท้จากโฟลเดอร์ public
      const fontUrl = "/fonts/THSarabunNew.ttf"; // เปลี่ยน Path ให้ตรง
      const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());

      // 3. เริ่มสร้างเอกสาร PDF
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // ✅ ติดตั้ง fontkit เพื่อให้รองรับภาษาไทย
      pdfDoc.registerFontkit(fontkit);
      const customFont = await pdfDoc.embedFont(fontBytes);

      // 4. ดึงหน้าแรกของ PDF มาวาด
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // เตรียมข้อมูลคนลา
      const creator = userData.find(
        (u) =>
          u.userId === record.createdById ||
          `${u.firstName} ${u.lastName}` === record.createdName,
      );

      const genderPrefix = creator
        ? creator.gender === "male"
          ? "นาย"
          : creator.gender === "female"
            ? "นาง"
            : creator.gender === "miss"
              ? "นางสาว"
              : ""
        : "";

      const creatorFullName = creator
        ? `${creator.firstName} ${creator.lastName}`
        : record.createdName || "-";

      const fullName = `${genderPrefix}${creatorFullName || ""}`;
      const fullNames = `(${genderPrefix}${creatorFullName || ""})`;

      const textSize = 16;
      const textColor = rgb(0, 0, 0); // สีดำ

      // ---------------------------------------------------------
      // 🎯 ส่วนเล็งพิกัด: แกน X (ซ้ายไปขวา) และ แกน Y (ล่างขึ้นบน)
      // กระดาษ A4 มีขนาดกว้าง 595, สูง 842
      // (จุด 0, 0 อยู่ที่ มุมซ้ายล่าง ของกระดาษนะครับ)
      // ---------------------------------------------------------

      // 1. วันที่เขียน
      firstPage.drawText(record.writeAt || "", {
        x: 400,
        y: 752,
        size: textSize,
        font: customFont,
        color: textColor,
      });
      firstPage.drawText(toThaiNumber(dayjs().format("D")), {
        x: 355,
        y: 733,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(dayjs().format("MMMM"), {
        x: 400,
        y: 733,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(toThaiNumber(dayjs().year() + 543), {
        x: 466,
        y: 733,
        size: textSize,
        font: customFont,
      });

      // 2. เรื่อง (กะระยะห่างลงมาจากวันที่ประมาณ 40 แต้ม)
      const leaveType = record.masterLeave?.leaveType || "";
      firstPage.drawText(`ขอ${leaveType}`, {
        x: 105,
        y: 710,
        size: textSize,
        font: customFont,
      });

      // 3. ชื่อ นามสกุล และตำแหน่ง (ย่อหน้าลงมาอีก)
      firstPage.drawText(fullName, {
        x: 150,
        y: 666,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(creator?.position || "", {
        x: 350,
        y: 666.5,
        size: textSize,
        font: customFont,
      });

      firstPage.drawText(fullNames, {
        x: 405,
        y: 400,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(creator?.position || "", {
        x: 405,
        y: 380,
        size: textSize,
        font: customFont,
      });

      // ✅ เพิ่มบรรทัดนี้: ข้อมูล "สังกัด" (แทรกไว้ตรงนี้เลยครับ)
      firstPage.drawText(
        "สำนักงานสาธารณสุขอำเภอวังเจ้า อำเภอวังเจ้า จังหวัดตาก",
        {
          x: 110, // 🎯 ลองขยับ X ดูนะครับ กะให้อยู่หลังคำว่า "สังกัด..."
          y: 645, // 🎯 แกน Y กะให้ต่ำกว่าบรรทัดชื่อ (635) ลงมา 20 แต้มครับ
          size: textSize,
          font: customFont,
        },
      );

      // 🎯 4. Checkbox ประเภทการลา (จัดกลุ่มตัวแปรพิกัดให้แก้ง่ายๆ)
      const cXBox = 152; // แกน X ของกล่องสี่เหลี่ยม
      const cXText = 232; // แกน X ของข้อความเหตุผลการลา
      const cY1 = 615; // แกน Y บรรทัดลาป่วย
      const cY2 = 595; // แกน Y บรรทัดลากิจ
      const cY3 = 575; // แกน Y บรรทัดลาคลอด

      // วาดกล่องเปล่ารอไว้ก่อน 3 กล่อง
      firstPage.drawText("☐", { x: cXBox, y: cY1, size: 18, font: customFont });
      firstPage.drawText("☐", { x: cXBox, y: cY2, size: 18, font: customFont });
      firstPage.drawText("☐", { x: cXBox, y: cY3, size: 18, font: customFont });

      // ติ๊กถูก ( / ) และใส่เหตุผลตามประเภท
      if (leaveType === "ลาป่วย") {
        firstPage.drawText("/", {
          x: cXBox + 4,
          y: cY1 + 2,
          size: 16,
          font: customFont,
        }); // +4, +2 เพื่อให้ / อยู่กลางกล่อง
        firstPage.drawText(record.reason || "", {
          x: cXText,
          y: cY1 + 6, // 🎯 ปรับแกน Y ของข้อความ +4 แยกจากกล่อง
          size: textSize,
          font: customFont,
        });
      } else if (leaveType === "ลากิจส่วนตัว") {
        firstPage.drawText("/", {
          x: cXBox + 4,
          y: cY2 + 2,
          size: 16,
          font: customFont,
        });
        firstPage.drawText(record.reason || "", {
          x: cXText,
          y: cY2 + 6, // 🎯 ปรับแกน Y ของข้อความ +4 แยกจากกล่อง
          size: textSize,
          font: customFont,
        });
      } else if (leaveType === "ลาคลอดบุตร") {
        firstPage.drawText("/", {
          x: cXBox + 4,
          y: cY3 + 2,
          size: 16,
          font: customFont,
        });
        firstPage.drawText(record.reason || "", {
          x: cXText,
          y: cY3 + 6, // 🎯 ปรับแกน Y ของข้อความ +4 แยกจากกล่อง
          size: textSize,
          font: customFont,
        });
      }

      // 5. วันที่เริ่มต้น - สิ้นสุด (ย่อหน้าลงมาอีก) เริ่มลา
      firstPage.drawText(formatThaiDate(record.dateStart), {
        x: 120,
        y: 556,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(formatThaiDate(record.dateEnd), {
        x: 260,
        y: 556,
        size: textSize,
        font: customFont,
      });

      // ✅ เพิ่ม: มีกำหนด ... วัน
      const leaveDays = calculateDays(record.dateStart, record.dateEnd);
      firstPage.drawText(toThaiNumber(leaveDays), {
        x: 460,
        y: 556,
        size: textSize,
        font: customFont,
      });

      // ---------------------------------------------------------
      // 🎯 5.1 ประวัติการลาครั้งสุดท้าย (ข้าพเจ้าได้ลา...)
      // ---------------------------------------------------------

      // 1. ดึงข้อมูลประวัติการลาครั้งล่าสุด (ที่อนุมัติแล้ว และเกิดก่อนการลาครั้งนี้)
      const historyLeaves = dataLeaveUser.filter((l) => {
        return (
          l.status === "approve" &&
          l.id !== record.id &&
          dayjs(l.dateEnd).isBefore(dayjs(record.dateStart), "day")
        );
      });
      // เรียงลำดับจากล่าสุดไปเก่าสุด
      historyLeaves.sort(
        (a, b) => dayjs(b.dateEnd).valueOf() - dayjs(a.dateEnd).valueOf(),
      );

      const lastLeave = historyLeaves.length > 0 ? historyLeaves[0] : null;
      const lastLeaveTypeName = lastLeave
        ? masterLeave.find((m) => m.id === lastLeave.typeId)?.leaveType || ""
        : "";
      const lastDuration = lastLeave
        ? calculateDays(lastLeave.dateStart, lastLeave.dateEnd)
        : 0;

      // 2. พิกัด Y สำหรับบรรทัดต่างๆ
      const yLast1 = 530; // 🎯 พิกัด Y สำหรับกล่อง Checkbox (ป่วย, กิจ, คลอด)
      const yLast1Date = 534; // 🎯 พิกัด Y สำหรับ "ครั้งสุดท้ายวันที่..." (แยกออกมาให้ปรับอิสระ)
      const yLast2 = 512; // บรรทัด: ถึงวันที่... มีกำหนด... วัน ในระหว่างลาจะติดต่อ...

      // 3. วาดกล่อง Checkbox รอไว้ 3 กล่อง (แกน X กะให้ตรงคำว่า ป่วย, กิจ, คลอด)
      const bxSick = 140;
      const bxPer = 183;
      const bxMat = 255;
      firstPage.drawText("☐", {
        x: bxSick,
        y: yLast1, // ใช้พิกัดกล่อง
        size: 18,
        font: customFont,
      });
      firstPage.drawText("☐", {
        x: bxPer,
        y: yLast1, // ใช้พิกัดกล่อง
        size: 18,
        font: customFont,
      });
      firstPage.drawText("☐", {
        x: bxMat,
        y: yLast1, // ใช้พิกัดกล่อง
        size: 18,
        font: customFont,
      });

      // 4. ติ๊กเครื่องหมาย / ลงกล่องที่ตรงกับประเภทการลาครั้งล่าสุด
      if (lastLeaveTypeName === "ลาป่วย") {
        firstPage.drawText("/", {
          x: bxSick + 4,
          y: yLast1 + 2, // ใช้พิกัดกล่อง
          size: 16,
          font: customFont,
        });
      } else if (lastLeaveTypeName === "ลากิจส่วนตัว") {
        firstPage.drawText("/", {
          x: bxPer + 4,
          y: yLast1 + 2, // ใช้พิกัดกล่อง
          size: 16,
          font: customFont,
        });
      } else if (lastLeaveTypeName === "ลาคลอดบุตร") {
        firstPage.drawText("/", {
          x: bxMat + 4,
          y: yLast1 + 2, // ใช้พิกัดกล่อง
          size: 16,
          font: customFont,
        });
      }

      // 5. เติมข้อความ วันที่ และ จำนวนวัน (ถ้าไม่มีประวัติ จะเว้นว่างไว้)
      if (lastLeave) {
        firstPage.drawText(formatThaiDate(lastLeave.dateStart), {
          x: 420,
          y: yLast1Date, // 🎯 เปลี่ยนมาใช้พิกัด Y ที่แยกออกมาเฉพาะของวันที่
          size: textSize,
          font: customFont,
        }); // ครั้งสุดท้ายวันที่...

        firstPage.drawText(formatThaiDate(lastLeave.dateEnd), {
          x: 120,
          y: yLast2,
          size: textSize,
          font: customFont,
        }); // ถึงวันที่...

        firstPage.drawText(toThaiNumber(lastDuration), {
          x: 285,
          y: yLast2,
          size: textSize,
          font: customFont,
        }); // มีกำหนด...วัน
      }

      // ✅ เพิ่ม: สถานที่ติดต่อและเบอร์โทร
      firstPage.drawText(record.contactAddress || "-", {
        x: 78,
        y: 490,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(record.contactPhone || "-", {
        x: 418,
        y: 490,
        size: textSize,
        font: customFont,
      });

      // ---------------------------------------------------------
      // 🎯 ส่วนของ "ตารางสถิติการลา"
      // ---------------------------------------------------------
      // คำนวณข้อมูลสถิติ
      const sickLeave = getLeaveStats("ลาป่วย");
      const personalLeave = getLeaveStats("ลากิจส่วนตัว");
      const maternityLeave = getLeaveStats("ลาคลอดบุตร");

      // พิกัด X ของแต่ละคอลัมน์ในตาราง (ค่าประมาณ ลองขยับดูนะครับ)
      const colUsed = 178; // คอลัมน์ "ลามาแล้ว"
      const colCurrent = 225; // คอลัมน์ "ลาครั้งนี้"
      const colTotal = 275; // คอลัมน์ "รวมวันลา"

      // พิกัด Y ของแต่ละแถวในตาราง (จากล่างขึ้นบน)
      const rowSick = 420; // แถว ลาป่วย
      const rowPersonal = 395; // แถว ลากิจส่วนตัว
      const rowMaternity = 373; // แถว ลาคลอดบุตร

      // แถว ลาป่วย
      firstPage.drawText(sickLeave.usedDays.toString(), {
        x: colUsed,
        y: rowSick,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(sickLeave.currentDays.toString(), {
        x: colCurrent,
        y: rowSick,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(sickLeave.totalDays.toString(), {
        x: colTotal,
        y: rowSick,
        size: textSize,
        font: customFont,
      });

      // แถว ลากิจส่วนตัว
      firstPage.drawText(personalLeave.usedDays.toString(), {
        x: colUsed,
        y: rowPersonal,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(personalLeave.currentDays.toString(), {
        x: colCurrent,
        y: rowPersonal,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(personalLeave.totalDays.toString(), {
        x: colTotal,
        y: rowPersonal,
        size: textSize,
        font: customFont,
      });

      // แถว ลาคลอดบุตร
      firstPage.drawText(maternityLeave.usedDays.toString(), {
        x: colUsed,
        y: rowMaternity,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(maternityLeave.currentDays.toString(), {
        x: colCurrent,
        y: rowMaternity,
        size: textSize,
        font: customFont,
      });
      firstPage.drawText(maternityLeave.totalDays.toString(), {
        x: colTotal,
        y: rowMaternity,
        size: textSize,
        font: customFont,
      });
      // ---------------------------------------------------------

      // 🎯 5. เพิ่มข้อมูล: ชื่อผู้ปฏิบัติงานแทน (ระหว่างลามอบให้...)
      const backupUser =
        record.backupUserId && userData.length
          ? userData.find((u) => u.userId === record.backupUserId)
          : null;
      const backupGenderPrefix = backupUser
        ? backupUser.gender === "male"
          ? "นาย"
          : backupUser.gender === "female"
            ? "นาง"
            : backupUser.gender === "miss"
              ? "นางสาว"
              : ""
        : "";
      const backupFullName = backupUser
        ? `${backupGenderPrefix}${backupUser.firstName} ${backupUser.lastName}`
        : "";

      // เล็งพิกัดให้ตรงกับบรรทัด "ระหว่างลามอบให้" (ตัวเลข y=200 เป็นแค่การประมาณ ลองขยับดูนะครับ)
      firstPage.drawText(backupFullName, {
        x: 155,
        y: 205,
        size: textSize,
        font: customFont,
      });

      // 6. บันทึกเป็นไฟล์ PDF ตัวใหม่
      const pdfBytesSaved = await pdfDoc.save();
      const blob = new Blob([pdfBytesSaved as any], {
        type: "application/pdf",
      });
      saveAs(blob, `ใบลา_${record.id}.pdf`);

      message.success({ content: "ดาวน์โหลด PDF สำเร็จ!", key: "export" });
    } catch (err) {
      console.error(err);
      message.error({
        content: "สร้าง PDF ไม่สำเร็จ ลองเช็คชื่อไฟล์ดูนะครับ",
        key: "export",
      });
    }
  };

  return (
    <Tooltip title="พิมพ์ PDF">
      <FilePdfOutlined
        style={{
          fontSize: 18,
          color: record.status === "approve" ? "#ff4d4f" : "#d9d9d9",
          cursor: record.status === "approve" ? "pointer" : "not-allowed",
        }}
        onClick={() => {
          if (record.status === "approve") {
            handleExportPdf();
          }
        }}
      />
    </Tooltip>
  );
};

export default DataLeavePdf;
