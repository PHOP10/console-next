import { AxiosInstance } from "axios";

export const DataLeaveService = (axiosInstance: AxiosInstance) => {
  const baseUrlApiDataLeave = "/dataLeave";
  const baseUrlApiMasterLeave = "/masterLeave";
  const baseUrlApiUser = "/user";

  return {
    getUserQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApiUser}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    getDataLeaveQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApiDataLeave}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    getDataLeaveByUserId: async (userId: string) => {
      return await axiosInstance
        .get(`${baseUrlApiDataLeave}/user/${userId}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createDataLeave: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlApiDataLeave}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateDataLeave: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiDataLeave}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteDataLeave: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApiDataLeave}/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    getMasterLeaveQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApiMasterLeave}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createMasterLeave: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlApiMasterLeave}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateMasterLeave: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiMasterLeave}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteMasterLeave: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApiMasterLeave}/${id}`)
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
