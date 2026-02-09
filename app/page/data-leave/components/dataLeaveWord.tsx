"use client";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { Tooltip, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveService } from "../services/dataLeave.service";
import { useEffect, useState } from "react";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import { userService } from "../../user/services/user.service";
import { FileWordOutlined } from "@ant-design/icons";
import Holidays from "date-holidays";
dayjs.locale("th");

const hd = new Holidays("TH");

interface DataLeaveWordProps {
  record: any;
}

const DataLeaveWord: React.FC<DataLeaveWordProps> = ({ record }) => {
  const intraAuth = useAxiosAuth();
  const intraAuthDataLeaveService = DataLeaveService(intraAuth);
  const intraAuthUserService = userService(intraAuth);
  const [userData, setUserData] = useState<UserType[]>([]);
  const [masterLeave, setMasterLeave] = useState<MasterLeaveType[]>([]);
  const [dataLeaveUser, setDataLeaveUser] = useState<DataLeaveType[]>([]);

  const fetchData = async () => {
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
    if (record.createdById) {
      fetchData();
    }
  }, [record]);

  const isHoliday = (date: dayjs.Dayjs) => {
    const holiday = hd.isHoliday(date.toDate());
    if (holiday && holiday[0].type === "public") {
      return true;
    }
    return false;
  };

  // ฟังก์ชันคำนวณจำนวนวัน
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

  // ✅ ฟังก์ชันแปลงเป็นเลขไทย (ใช้กับวันที่ และส่วนอื่นๆ)
  const toThaiNumber = (input: string | number | undefined | null): string => {
    if (input === undefined || input === null || input === "") return "";
    const thaiDigits = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
    return input
      .toString()
      .replace(/[0-9]/g, (digit) => thaiDigits[parseInt(digit)]);
  };

  // ✅ เพิ่มฟังก์ชันจัดการเลขอารบิก (สำหรับเบอร์โทร และ ตาราง)
  const toArabicNumber = (
    input: string | number | undefined | null,
  ): string => {
    if (input === undefined || input === null || input === "") return "";
    return input.toString(); // ส่งคืนเป็น string ปกติ (เลขอารบิก)
  };

  const formatThaiDate = (date: string | Date | undefined) => {
    if (!date) return "....................";
    const d = dayjs(date);
    const day = toThaiNumber(d.format("D"));
    const month = d.format("MMMM");
    const year = toThaiNumber(d.year() + 543);
    return `${day} ${month} ${year}`;
  };

  // Logic สถิติวันลา
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

  const handleExport = async () => {
    try {
      if (masterLeave.length === 0 || dataLeaveUser.length === 0) {
        await fetchData();
        message.warning("กำลังโหลดข้อมูล กรุณากดใหม่อีกครั้ง");
        return;
      }

      const response = await fetch("/dataLeaveTemplate.docx");
      if (!response.ok) throw new Error("ไม่สามารถโหลด template.docx");
      const arrayBuffer = await response.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: (part) => (part.value ? part.value : ""),
      });

      // --- ข้อมูล User ---
      const creator = userData.find((u) => {
        if (record.createdById) return u.userId === record.createdById;
        return `${u.firstName} ${u.lastName}` === record.createdName;
      });

      const backupUser =
        record.backupUserId && userData.length
          ? userData.find((u) => u.userId === record.backupUserId)
          : null;
      const backupUserName = backupUser
        ? `${backupUser.firstName} ${backupUser.lastName}`
        : "-";

      const genderPrefix = creator
        ? creator.gender === "male"
          ? "นาย"
          : creator.gender === "female"
            ? "นาง"
            : creator.gender === "miss"
              ? "นางสาว"
              : (creator.gender ?? "-")
        : "-";

      // ✅ คำนวณคำนำหน้าชื่อผู้ปฏิบัติงานแทน (backupGenderPrefix) เพื่อใช้เป็น gds
      const backupGenderPrefix = backupUser
        ? backupUser.gender === "male"
          ? "นาย"
          : backupUser.gender === "female"
            ? "นาง"
            : backupUser.gender === "miss"
              ? "นางสาว"
              : (backupUser.gender ?? "-")
        : "-";

      const userPosition = creator?.position || "ไม่ระบุตำแหน่ง";

      // --- ประวัติการลาครั้งก่อน ---
      const historyLeaves = dataLeaveUser.filter((l) => {
        return (
          l.status === "approve" &&
          l.id !== record.id &&
          dayjs(l.dateEnd).isBefore(dayjs(record.dateStart), "day")
        );
      });
      historyLeaves.sort(
        (a, b) => dayjs(b.dateEnd).valueOf() - dayjs(a.dateEnd).valueOf(),
      );
      const lastLeave = historyLeaves.length > 0 ? historyLeaves[0] : null;
      const lastLeaveTypeName = lastLeave
        ? masterLeave.find((m) => m.id === lastLeave.typeId)?.leaveType || ""
        : "";

      // --- ตัวแปรสำหรับ Template ---
      const checked = "☑";
      const unchecked = "☐";
      const currentLeaveType = record.masterLeave?.leaveType ?? "-";

      // ✅ คำนวณจำนวนวันลา "ปัจจุบัน" (ที่ถูกต้อง)
      const currentDuration = calculateDays(record.dateStart, record.dateEnd);

      const lastDuration = lastLeave
        ? calculateDays(lastLeave.dateStart, lastLeave.dateEnd)
        : 0;

      const sickLeave = getLeaveStats("ลาป่วย");
      const maternityLeave = getLeaveStats("ลาคลอดบุตร");
      const personalLeave = getLeaveStats("ลากิจส่วนตัว");

      const data = {
        // --- ส่วนหัว ---
        writeAt: record.writeAt || "....................",
        D: toThaiNumber(dayjs().format("D")),
        MM: dayjs().format("MMMM"),
        BBBB: toThaiNumber(dayjs().year() + 543),

        leaveType: currentLeaveType,
        gd: genderPrefix,
        createdBy: record.createdName || "-",
        userPosition: userPosition,

        // --- การลาครั้งนี้ ---
        dateStart: formatThaiDate(record.dateStart),
        dateEnd: formatThaiDate(record.dateEnd),

        // ✅ เพิ่มตัวแปรนี้: สำหรับแสดงจำนวนวันลาปัจจุบัน (๑๔ วัน)
        ctLeaveDays: toThaiNumber(currentDuration),

        // Checkbox
        cS: currentLeaveType === "ลาป่วย" ? checked : unchecked,
        cP: currentLeaveType === "ลากิจส่วนตัว" ? checked : unchecked,
        cM: currentLeaveType === "ลาคลอดบุตร" ? checked : unchecked,
        r1: currentLeaveType === "ลาป่วย" ? record.reason : "",
        r2: currentLeaveType === "ลากิจส่วนตัว" ? record.reason : "",
        r3: currentLeaveType === "ลาคลอดบุตร" ? record.reason : "",

        // --- ประวัติการลาครั้งก่อน (ใช้ leaveD สำหรับครั้งก่อน) ---
        sS: lastLeaveTypeName === "ลาป่วย" ? checked : unchecked,
        sP: lastLeaveTypeName === "ลากิจส่วนตัว" ? checked : unchecked,
        sM: lastLeaveTypeName === "ลาคลอดบุตร" ? checked : unchecked,
        dateStarts: lastLeave
          ? formatThaiDate(lastLeave.dateStart)
          : "....................",
        dateEnds: lastLeave
          ? formatThaiDate(lastLeave.dateEnd)
          : "....................",

        // ตัวแปร leaveD เดิม ใช้แสดงจำนวนวันของ "ครั้งก่อน" (เช่น ๔ วัน)
        leaveD: lastLeave ? toThaiNumber(lastDuration) : ".....",

        // --- อื่นๆ ---
        cAd:
          record.contactAddress || "........................................",
        contactPhone: record.contactPhone || "....................",
        gds: backupGenderPrefix,
        backupUser: backupUserName,
        approvedBy: record.approvedByName || "....................",
        approvedDate: record.approvedDate
          ? formatThaiDate(record.approvedDate)
          : "....................",

        // สถิติ
        // ✅ แก้ไข: สถิติในตารางเป็นเลขอารบิก (toArabicNumber)
        sickU: toArabicNumber(sickLeave.usedDays),
        sickC: toArabicNumber(sickLeave.currentDays),
        sickTt: toArabicNumber(sickLeave.totalDays),

        matUs: toArabicNumber(maternityLeave.usedDays),
        matCu: toArabicNumber(maternityLeave.currentDays),
        matTt: toArabicNumber(maternityLeave.totalDays),

        perUs: toArabicNumber(personalLeave.usedDays),
        perCu: toArabicNumber(personalLeave.currentDays),
        perTt: toArabicNumber(personalLeave.totalDays),
      };

      doc.render(data);

      const blob = doc.getZip().generate({ type: "blob" });
      saveAs(blob, `ใบลา_${record.id}.docx`);
    } catch (error) {
      console.error("Export Word error:", error);
      message.error("เกิดข้อผิดพลาดในการ Export");
    }
  };

  return (
    <>
      <Tooltip title="ดาวน์โหลดใบลา (Word)">
        <FileWordOutlined
          style={{
            fontSize: 18,
            color: record.status === "approve" ? "#1677ff" : "#d9d9d9",
            cursor: record.status === "approve" ? "pointer" : "not-allowed",
            transition: "color 0.2s",
          }}
          onClick={() => {
            if (record.status === "approve") {
              handleExport();
            }
          }}
        />
      </Tooltip>
    </>
  );
};

export default DataLeaveWord;
