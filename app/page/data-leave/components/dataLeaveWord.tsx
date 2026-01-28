"use client";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { Button, Tooltip } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveService } from "../services/dataLeave.service";
import { useEffect, useState } from "react";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import { userService } from "../../user/services/user.service";
import { ExportOutlined, FileWordOutlined } from "@ant-design/icons";

dayjs.locale("th");

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
    fetchData();
  }, []);

  // ฟังก์ชันคำนวณวันลา
  const calculateDays = (start: string | Date, end: string | Date) => {
    if (!start || !end) return 0;
    return dayjs(end).endOf("day").diff(dayjs(start).startOf("day"), "day") + 1;
  };

  // ฟังก์ชันคำนวณสรุปการลาตามประเภท
  const getLeaveStats = (leaveTypeName: string) => {
    const leave = masterLeave.find((l) => l.leaveType === leaveTypeName);
    if (!leave) return { usedDays: 0, currentDays: 0, totalDays: 0 };

    // ลามาแล้ว (approve แล้ว ไม่รวมครั้งปัจจุบัน)
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

    // ลาครั้งนี้
    const currentDays =
      record.typeId === leave.id
        ? calculateDays(record.dateStart, record.dateEnd)
        : 0;

    // รวมการลา
    const totalDays = usedDays + currentDays;

    return { usedDays, currentDays, totalDays };
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/dataLeaveTemplate.docx");
      if (!response.ok) throw new Error("ไม่สามารถโหลด template.docx");
      const arrayBuffer = await response.arrayBuffer();

      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const backupUser =
        record.backupUserId && userData.length
          ? userData.find((u) => u.userId === record.backupUserId)
          : null;
      const backupUserName = backupUser
        ? `${backupUser.firstName} ${backupUser.lastName}`
        : "-";

      const creators = userData.find((u) => {
        const fullName = `${u.firstName} ${u.lastName}`;
        return fullName === backupUserName;
      });
      const genderPrefixs = creators
        ? creators.gender === "male"
          ? "นาย"
          : creators.gender === "female"
            ? "นาง"
            : creators.gender === "miss"
              ? "นางสาว"
              : (creators.gender ?? "-")
        : "-";

      // const userPosition =
      //   record.createdName && userData.length
      //     ? userData.find((u) => u.username === record.createdName)
      //     : null;
      const userPosition =
        record.createdName && userData.length > 0
          ? userData.find(
              (u) => `${u.firstName} ${u.lastName}` === record.createdName,
            )?.position || "ไม่ระบุตำแหน่ง"
          : "ไม่ระบุตำแหน่ง";

      // console.log("User:", userPosition);
      // console.log("User:", userData);
      // console.log("User:", record.createdName);

      const toThaiNumber = (input: string | number): string => {
        const thaiDigits = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"];
        return input
          .toString()
          .replace(/[0-9]/g, (digit) => thaiDigits[parseInt(digit)]);
      };

      const formatThaiDate = (date: string | Date) => {
        const d = dayjs(date);
        const day = toThaiNumber(d.format("D"));
        const month = d.format("MMMM");
        const year = toThaiNumber(d.year() + 543);
        return `${day} ${month} ${year}`;
      };

      const leaveType = record.masterLeave?.leaveType ?? "-";
      const leaveTypes = record.masterLeave?.leaveType ?? "-";

      const sortedLeave = [...(dataLeaveUser || [])].sort(
        (a, b) => dayjs(b.dateEnd).valueOf() - dayjs(a.dateEnd).valueOf(),
      );

      // ถ้ามีหลายครั้ง → เอาครั้งก่อนล่าสุด (index 1)
      // ถ้ามีครั้งเดียว → เอาครั้งนั้นเอง (index 0)
      const previousLeave = sortedLeave[1] || sortedLeave[0];

      const latestDateStart = previousLeave?.dateStart;
      const latestDateEnd = previousLeave?.dateEnd;

      const sickLeave = getLeaveStats("ลาป่วย");
      const maternityLeave = getLeaveStats("ลาคลอดบุตร");
      const personalLeave = getLeaveStats("ลากิจส่วนตัว");

      const leaveD =
        latestDateStart && latestDateEnd
          ? dayjs(latestDateEnd).diff(dayjs(latestDateStart), "day") + 1
          : 0;
      const checked = "☑"; // \u2611
      const unchecked = "☐"; // \u2610
      const checkeds = "(/)"; // กรณีเลือก
      const uncheckeds = "( )"; // กรณีไม่ได้เลือก

      const creator = userData.find((u) => {
        const fullName = `${u.firstName} ${u.lastName}`;
        return fullName === record.createdName;
      });

      // 2. ตรวจสอบเพศ/คำนำหน้าจาก User ที่หาเจอ
      const genderPrefix = creator
        ? creator.gender === "male"
          ? "นาย"
          : creator.gender === "female"
            ? "นาง"
            : creator.gender === "miss"
              ? "นางสาว"
              : (creator.gender ?? "-")
        : "-";

      const data = {
        dateStart: record.dateStart ? formatThaiDate(record.dateStart) : "-",
        dateEnd: record.dateEnd ? formatThaiDate(record.dateEnd) : "-",
        writeAt: record.writeAt || "-",
        contactAddress: record.contactAddress || "-",
        contactPhone: record.contactPhone || "-",
        backupUser: backupUserName,
        userPosition: userPosition,
        leaveType: leaveType,
        details: record.details || "-",
        status: record.status || "-",
        approvedBy: record.approvedByName || "-",
        approvedDate: record.approvedDate
          ? formatThaiDate(record.approvedDate)
          : "-",
        createdBy: record.createdName || "-",
        createdAt: record.createdAt ? formatThaiDate(record.createdAt) : "-",
        D: record.createdAt
          ? toThaiNumber(dayjs(record.createdAt).format("D"))
          : "-",
        MM: record.createdAt
          ? dayjs(record.createdAt).locale("th").format("MMMM")
          : "-",
        BBBB: record.createdAt
          ? toThaiNumber(dayjs(record.createdAt).year() + 543)
          : "-",
        dateStarts: latestDateStart ? formatThaiDate(latestDateStart) : "-",
        dateEnds: latestDateEnd ? formatThaiDate(latestDateEnd) : "-",
        leaveD,
        gd: genderPrefix,
        gds: genderPrefixs,
        sS: leaveTypes === "ลาป่วย" ? checked : unchecked,
        sP: leaveTypes === "ลากิจส่วนตัว" ? checked : unchecked,
        sM: leaveTypes === "ลาคลอดบุตร" ? checked : unchecked,

        cS: leaveType === "ลาป่วย" ? checked : unchecked,
        cP: leaveType === "ลากิจส่วนตัว" ? checked : unchecked,
        cM: leaveType === "ลาคลอดบุตร" ? checked : unchecked,

        r1: leaveType === "ลาป่วย" ? record.reason : "",
        r2: leaveType === "ลากิจส่วนตัว" ? record.reason : "",
        r3: leaveType === "ลาคลอดบุตร" ? record.reason : "",

        // ✅ สรุปการลา - ลาป่วย
        sickUsed: sickLeave.usedDays,
        sickCurrent: sickLeave.currentDays,
        sickTotal: sickLeave.totalDays,

        // ✅ สรุปการลา - ลาคลอดบุตร
        matUs: maternityLeave.usedDays,
        matCur: maternityLeave.currentDays,
        matTot: maternityLeave.totalDays,

        // ✅ สรุปการลา - ลากิจส่วนตัว
        perUs: personalLeave.usedDays,
        perCur: personalLeave.currentDays,
        perTot: personalLeave.totalDays,
      };

      doc.render(data);

      const blob = doc.getZip().generate({ type: "blob" });
      saveAs(blob, `ใบลา_${record.id}.docx`);
    } catch (error) {
      console.error("Export Word error:", error);
    }
  };

  return (
    <>
      <Tooltip title="Export">
        <FileWordOutlined
          style={{
            fontSize: 22,
            color: record.status === "approve" ? "#1677ff" : "#d9d9d9",
            cursor: record.status === "approve" ? "pointer" : "not-allowed",
            transition: "color 0.2s",
          }}
          onClick={() => {
            if (record.status === "approve") {
              handleExport();
            }
          }}
          onMouseEnter={(e) => {
            if (record.status === "approve") {
              (e.currentTarget as HTMLElement).style.color = "#0958d9";
            }
          }}
          onMouseLeave={(e) => {
            if (record.status === "approve") {
              (e.currentTarget as HTMLElement).style.color = "#1677ff";
            }
          }}
        />
      </Tooltip>
    </>
  );
};

export default DataLeaveWord;
