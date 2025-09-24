"use client";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { Button } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/th";
import useAxiosAuth from "@/app/lib/axios/hooks/userAxiosAuth";
import { DataLeaveService } from "../services/dataLeave.service";
import { useEffect, useState } from "react";
import { DataLeaveType, MasterLeaveType, UserType } from "../../common";
import { userService } from "../../user/services/user.service";

dayjs.locale("th");

interface DataLeaveWordProps {
  record: any; // ควรเป็น DataLeave type
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
          record.createdById
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

  const latestLeave =
    dataLeaveUser.length > 0
      ? dataLeaveUser.reduce((prev, current) =>
          new Date(prev.createdAt) > new Date(current.createdAt)
            ? prev
            : current
        )
      : null;

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

      // 🔍 หาชื่อผู้รับผิดชอบงานจาก backupUserId
      const backupUser =
        record.backupUserId && userData.length
          ? userData.find((u) => u.userId === record.backupUserId)
          : null;
      const backupUserName = backupUser
        ? `${backupUser.firstName} ${backupUser.lastName}`
        : "-";

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

      // 🔍 ประเภทการลา
      const leaveType = record.masterLeave?.leaveType ?? "-";

      const latestLeave =
        dataLeaveUser.length > 0
          ? dataLeaveUser.reduce((prev, current) =>
              new Date(prev.createdAt) > new Date(current.createdAt)
                ? prev
                : current
            )
          : null;
      const latestDateStart = latestLeave ? latestLeave.dateStart : null;
      const latestDateEnd = latestLeave ? latestLeave.dateEnd : null;

      const data = {
        dateStart: record.dateStart ? formatThaiDate(record.dateStart) : "-",
        dateEnd: record.dateEnd ? formatThaiDate(record.dateEnd) : "-",
        writeAt: record.writeAt || "-",
        contactAddress: record.contactAddress || "-",
        contactPhone: record.contactPhone || "-",
        backupUser: backupUserName,
        leaveType: leaveType, // เพิ่มตรงนี้
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
      };

      doc.render(data);

      const blob = doc.getZip().generate({ type: "blob" });
      saveAs(blob, `ใบลาครั้งที่_${record.id}.docx`);
    } catch (error) {
      console.error("Export Word error:", error);
    }
  };

  return (
    <Button
      size="small"
      type="primary"
      onClick={handleExport}
      disabled={record.status !== "pending"}
    >
      Export Word
    </Button>
  );
};

export default DataLeaveWord;
