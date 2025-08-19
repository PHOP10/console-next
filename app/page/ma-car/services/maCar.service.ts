import { AxiosInstance } from "axios";

export const maCarService = (axiosInstance: AxiosInstance) => {
  const baseUrlApiMaCar = "/maCar";
  const baseUrlApiMasterCar = "/masterCar";
  return {
    getMaCarQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApiMaCar}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createMaCar: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlApiMaCar}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateMaCar: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiMaCar}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteMaCar: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApiMaCar}/${id}`)
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

    createMasterCar: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlApiMasterCar}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateMasterCar: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiMasterCar}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteMasterCar: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApiMasterCar}/${id}`)
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
