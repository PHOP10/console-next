import { AxiosInstance } from "axios";

export const MaDrug = (axiosInstance: AxiosInstance) => {
  const baseUrlApimaDrug = "/maDrug";
  const baseUrlApiDrug = "/drug";
  const baseUrlApiMasterDrug = "/masterDrug";
  return {
    getMaDrugQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApimaDrug}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createMaDrug: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlApimaDrug}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateMaDrug: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApimaDrug}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteMaDrug: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApimaDrug}/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    receiveMaDrug: async (id: any) => {
      return await axiosInstance
        .patch(`${baseUrlApimaDrug}/${id}/receive`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          // อาจจะ throw error เพื่อให้หน้าบ้านรู้ว่าทำรายการไม่สำเร็จ
          throw err;
        });
    },

    getDrugQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApiDrug}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createDrug: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlApiDrug}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateDrug: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiDrug}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteDrug: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApiDrug}/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    getMasterDrugQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApiMasterDrug}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createMasterDrug: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlApiMasterDrug}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateMasterDrug: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiMasterDrug}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteMasterDrug: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApiMasterDrug}/${id}`)
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
