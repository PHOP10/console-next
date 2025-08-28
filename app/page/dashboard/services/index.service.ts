import { IDashboard } from "@/utils/chart-helper";
import { AxiosInstance } from "axios";
import { Dayjs } from "dayjs";

export interface ITDriverServices {
  findAll: (startDate: Dayjs, endDate: Dayjs) => Promise<IDashboard[]>;
}
const DashboardService = (axiosInstance: AxiosInstance): ITDriverServices => {
  const dashboardUrl = "api/dashboard";
  return {
    findAll: async (startDate, endDate) => {
      return await axiosInstance
        .get(`${dashboardUrl}?startDate=${startDate}&endDate=${endDate}`)
        .then((res) => res.data);
    },
  };
};
export default DashboardService;
