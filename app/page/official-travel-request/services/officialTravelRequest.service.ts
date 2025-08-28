import { AxiosInstance } from "axios";

export const officialTravelRequestService = (axiosInstance: AxiosInstance) => {
  const baseUrlApiOfficialTravelRequest = "/officialTravelRequest";
  const baseUrlApiMasterCar = "/masterCar";

  return {
    getOfficialTravelRequestQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApiOfficialTravelRequest}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createOfficialTravelRequest: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlApiOfficialTravelRequest}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateOfficialTravelRequest: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiOfficialTravelRequest}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteOfficialTravelRequest: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApiOfficialTravelRequest}/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    getMasterCarQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApiMasterCar}`)
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
