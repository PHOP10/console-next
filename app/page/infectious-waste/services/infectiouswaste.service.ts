import { AxiosInstance } from "axios";

export const infectiousWasteServices = (axiosInstance: AxiosInstance) => {
  const baseUrlApiinfectiousWaste = "/infectiousWaste";
  return {
    getInfectiousWasteQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApiinfectiousWaste}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createInfectiousWaste: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlApiinfectiousWaste}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateInfectiousWaste: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiinfectiousWaste}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteInfectiousWaste: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApiinfectiousWaste}/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
  };
};
