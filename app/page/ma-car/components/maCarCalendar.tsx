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

  const getUserName = (idOrName: string) => {
    if (!idOrName) return "-";
    const user = dataUser.find((u) => u.userId === idOrName);
    return user ? `${user.firstName} ${user.lastName}` : idOrName;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#3b82f6";
      case "approve":
        return "#10b981";
      case "cancel":
        return "#ef4444";
      case "edit":
        return "#f97316";
      case "return":
        return "#a855f7";
      case "success":
        return "#6b7280";
      default:
        return "#3b82f6";
    }
  };

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
      <div className="mb-6 -mt-7">
        <h2 className="text-2xl font-bold text-blue-600 text-center mb-2 tracking-tight">
          ปฏิทินการจองรถ
        </h2>
        <hr className="border-slate-100/20 -mx-6 md:-mx-6" />
      </div>

      <div className="modern-calendar-wrapper">
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
          dayPropGetter={() => ({
            style: {
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
            },
          })}
          eventPropGetter={(event) => {
            const color = getStatusColor(event.status);
            return {
              style: {
                backgroundColor: `${color}1A`,
                color: color,
                border: `1px solid ${color}4D`,
                borderTop: "1px solid #e2e8f0",
                fontSize: 12,
                borderRadius: "4px",
                fontWeight: 600,
                padding: "2px 6px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                marginBottom: "2px",
              },
            };
          }}
          messages={{
            next: "ถัดไป",
            previous: "ย้อนกลับ",
            today: "วันนี้",
            month: "เดือน",
            week: "สัปดาห์",
            day: "วัน",
            agenda: "กำหนดการ",
            date: "วันที่",
            time: "เวลา",
            event: "การจอง",
            showMore: (total) => `+ อีก ${total} รายการ`,
          }}
        />
      </div>

      <style jsx global>{`
        /* สีประจำวัน */
        .rbc-header:nth-child(1) {
          background-color: #fef2f2;
          color: #dc2626;
          border-bottom: 2px solid #fecaca;
        }
        .rbc-header:nth-child(2) {
          background-color: #fefce8;
          color: #a16207;
          border-bottom: 2px solid #fef08a;
        }
        .rbc-header:nth-child(3) {
          background-color: #fdf2f8;
          color: #db2777;
          border-bottom: 2px solid #fbcfe8;
        }
        .rbc-header:nth-child(4) {
          background-color: #f0fdf4;
          color: #16a34a;
          border-bottom: 2px solid #bbf7d0;
        }
        .rbc-header:nth-child(5) {
          background-color: #fff7ed;
          color: #ea580c;
          border-bottom: 2px solid #fed7aa;
        }
        .rbc-header:nth-child(6) {
          background-color: #e0f2fe;
          color: #0284c7;
          border-bottom: 2px solid #bae6fd;
        }
        .rbc-header:nth-child(7) {
          background-color: #faf5ff;
          color: #9333ea;
          border-bottom: 2px solid #e9d5ff;
        }

        /* Toolbar */
        .rbc-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          flex-wrap: wrap; /* Allow wrapping */
          gap: 8px;
        }
        .rbc-toolbar-label {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
        }

        /* Buttons */
        .rbc-btn-group button {
          border: 1px solid #cbd5e1 !important;
          background-color: #fff;
          color: #475569;
          padding: 6px 14px;
          font-size: 0.9rem;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .rbc-btn-group > button:first-child {
          border-top-left-radius: 8px;
          border-bottom-left-radius: 8px;
        }
        .rbc-btn-group > button:last-child {
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        .rbc-btn-group button.rbc-active {
          background-color: #2563eb !important;
          color: #fff !important;
          border-color: #2563eb !important;
        }

        /* Grid */
        .rbc-month-view {
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          overflow: hidden;
          background-color: #fff;
        }
        .rbc-header {
          padding: 12px 0;
          font-size: 0.95rem;
          font-weight: 700;
        }
        .rbc-day-bg {
          border-left: 1px solid #e2e8f0;
        }
        .rbc-month-row + .rbc-month-row {
          border-top: 1px solid #e2e8f0;
        }
        .rbc-off-range-bg {
          background-color: #f8fafc !important;
        }
        .rbc-date-cell {
          padding: 6px 8px;
          font-weight: 600;
          color: #64748b;
        }

        /* Current Day */
        .rbc-now .rbc-button-link {
          color: #fff;
          background: #2563eb;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* --- Mobile Responsive Styles --- */
        @media (max-width: 768px) {
          /* Stack Toolbar */
          .rbc-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .rbc-toolbar-label {
            margin: 0;
            font-size: 1.25rem;
            order: -1; /* Title on top */
          }

          /* Full width button groups */
          .rbc-btn-group {
            display: flex;
            width: 100%;
          }

          .rbc-btn-group button {
            flex: 1;
            padding: 8px 4px;
            font-size: 0.85rem;
            justify-content: center;
          }

          /* Adjust Headers */
          .rbc-header {
            font-size: 0.75rem;
            font-weight: normal; /* กฎข้อ 4 */
            padding: 4px 0;
            text-overflow: ellipsis;
            overflow: hidden;
          }

          /* Adjust Date Cells */
          .rbc-date-cell {
            font-size: 0.8rem;
            padding: 2px 4px;
            font-weight: normal; /* กฎข้อ 4 */
          }

          /* Adjust Events */
          .rbc-event {
            font-size: 0.7rem !important;
            padding: 1px 4px !important;
            line-height: 1.2;
          }
        }
      `}</style>

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
