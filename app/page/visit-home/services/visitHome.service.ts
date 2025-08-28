import { AxiosInstance } from "axios";

export const visitHomeServices = (axiosInstance: AxiosInstance) => {
  const baseUrlApiVisitHome = "/visitHome";
  const baseUrlApiMasterPatient = "/masterPatient";

  return {
    getVisitHomeQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApiVisitHome}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createVisitHomeWaste: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlApiVisitHome}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateVisitHome: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiVisitHome}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteVisitHome: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApiVisitHome}/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    getMasterPatientQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApiMasterPatient}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createMasterPatient: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlApiMasterPatient}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateMasterPatient: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiMasterPatient}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteMasterPatient: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApiMasterPatient}/${id}`)
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
