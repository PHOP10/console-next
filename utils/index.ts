import dayjs from "dayjs";

export const getRangeDate = (value: string) => {
  if (value === "toDay") {
    return [dayjs(new Date()).startOf("date"), dayjs(new Date()).endOf("date")];
  } else if (value === "yesTerDay") {
    return [
      dayjs(new Date()).startOf("date").subtract(1, "day"),
      dayjs(new Date()).endOf("date").subtract(1, "day"),
    ];
  } else if (value === "thisWeek") {
    return [
      dayjs(new Date()).startOf("date").startOf("week"),
      dayjs(new Date()).endOf("date").endOf("week"),
    ];
  } else if (value === "lastWeek") {
    return [
      dayjs(new Date()).subtract(1, "week").startOf("week"),
      dayjs(new Date()).subtract(1, "week").endOf("week"),
    ];
  } else if (value === "thisMouth") {
    return [
      dayjs(new Date()).startOf("month"),
      dayjs(new Date()).endOf("month"),
    ];
  } else if (value === "lastMonth") {
    return [
      dayjs(new Date()).subtract(1, "month").startOf("month"),
      dayjs(new Date()).subtract(1, "month").endOf("month"),
    ];
  } else if (value === "yearToDay") {
    return [dayjs(new Date()).startOf("year"), dayjs(new Date())];
  } else if (value === "threedays") {
    return [
      dayjs(new Date()).startOf("date").subtract(3, "day"),
      dayjs(new Date()).endOf("date").add(3, "day"),
    ];
  }
  return undefined;
};

export function formatNumberWithCommas(number: number | undefined) {
  if (!number) return "0.00";
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedNumber = formatter.format(number);
  return formattedNumber;
}

export function formatDate(date: string) {
  if (date !== null && date !== "-" && date !== "") {
    return dayjs(date).locale("th").format("DD-MM-YYYY");
  }
  return "";
}
export function formatTime(date: string) {
  if (date !== null && date !== "-" && date !== "") {
    return dayjs(date).locale("th").format("HH:mm น.");
  }
  return "";
}
export function formatDateTime(date: string) {
  if (date !== null && date !== "-" && date !== "") {
    return dayjs(date).locale("th").format("DD-MM-YYYY HH:mm:ss น.");
  }
  return "";
}
export function formatDateTh(date: string) {
  if (date !== null && date !== "-" && date !== "") {
    return dayjs(date).locale("th").add(543, "year").format("DD-MM-YYYY");
  }
  return "";
}
export function formatDateTimeTh(date: any) {
  if (date !== null && date !== "-" && date !== "") {
    return dayjs(date)
      .locale("th")
      .add(543, "year")
      .format("DD-MM-YYYY HH:mm:ss น.");
  }
  return "";
}
