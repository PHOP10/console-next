"use client";

import React, { useState } from "react";
import {
  Calendar,
  momentLocalizer,
  Event as RbcEvent,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { MaCarType, MasterCarType, UserType } from "../../common";
import moment from "moment";
import "moment/locale/th";
import MaCarDetail from "./maCarDetail";

const localizer = momentLocalizer(moment);

interface CustomEvent extends RbcEvent {
  id: number;
  status: string;
  title: string;
  location: string;
  masterCar: string;
  passengers: number;
  budget?: number;
  originalRecord: MaCarType;
}

interface Props {
  data: MaCarType[];
  loading: boolean;
  fetchData: () => void;
  cars: MasterCarType[];
  dataUser: UserType[];
}

const MaCarCalendar: React.FC<Props> = ({ data, cars, dataUser }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  // Helper Function
  const getUserName = (idOrName: string) => {
    if (!idOrName) return "-";
    const user = dataUser.find((u) => u.userId === idOrName);
    return user ? `${user.firstName} ${user.lastName}` : idOrName;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approve":
        return "#10b981";
      case "cancel":
        return "#ef4444";
      case "pending":
        return "#3b82f6";
      case "edit":
        return "#f97316";
      default:
        return "#3b82f6";
    }
  };

  // ✅ แก้ไขตรงนี้: รับแค่ event และ setSelected แค่ item
  const onSelectEvent = (event: CustomEvent) => {
    const item = data.find((d) => d.id === event.id);
    if (item) {
      setSelectedRecord({ ...item, dataUser });

      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-700 mb-4 border-l-4 border-blue-500 pl-3">
          ปฏิทินการจองรถ
        </h2>

        <Calendar<CustomEvent>
          localizer={localizer}
          events={data.map(
            (item): CustomEvent => ({
              id: item.id,
              title: getUserName(item.createdName),
              start: new Date(item.dateStart),
              end: new Date(item.dateEnd),
              status: item.status,
              location: item.destination,
              masterCar: `ID: ${item.carId}`,
              passengers: item.passengers,
              budget: item.budget,
              originalRecord: item,
            }),
          )}
          style={{ height: 600, fontFamily: "Prompt, sans-serif" }}
          onSelectEvent={onSelectEvent}
          eventPropGetter={(event: CustomEvent) => {
            const color = getStatusColor(event.status);
            return {
              style: {
                backgroundColor: `${color}1A`,
                color: color,
                border: `1px solid ${color}4D`,
                fontSize: 12,
                borderRadius: 6,
                fontWeight: 500,
                padding: "2px 5px",
              },
            };
          }}
          messages={{
            next: "ถัดไป",
            previous: "ก่อนหน้า",
            today: "วันนี้",
            month: "เดือน",
            week: "สัปดาห์",
            day: "วัน",
            agenda: "กำหนดการ",
            date: "วันที่",
            time: "เวลา",
            event: "การจอง",
            showMore: (total) => `+ ดูอีก ${total} รายการ`,
          }}
        />
      </div>

      {/* ✅ dataUser ถูกส่งไปที่ MaCarDetail ตรงนี้อยู่แล้วครับ */}
      <MaCarDetail
        open={modalOpen}
        onClose={handleCloseModal}
        record={selectedRecord}
        dataUser={dataUser}
      />
    </>
  );
};

export default MaCarCalendar;
