export type TypeDateFilter =
  | "toDay"
  | "yesTerDay"
  | "thisWeek"
  | "lastWeek"
  | "thisMouth"
  | "lastMonth"
  | "yearToDay"
  | "threedays";

export const optionsDateFilter = [
  { value: "toDay", label: "ToDay" },
  { value: "yesTerDay", label: "Yesterday" },
  { value: "threedays", label: "3Day>ToDay<3Day" },
  { value: "thisWeek", label: "This week" },
  { value: "lastWeek", label: "Last week" },
  { value: "thisMouth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "yearToDay", label: "Year to Day" },
];

export const optionNumber = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },
];
