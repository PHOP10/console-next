import { AxiosInstance } from "axios";

export const MaDrug = (axiosInstance: AxiosInstance) => {
  const baseUrlApimaDrug = "/maDrug";
  const baseUrlApiDrug = "/drug";
  const baseUrlApiMasterDrug = "/masterDrug";
  const baseUrlApiDispense = "/dispense";

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
      console.log(1);
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

    editMaDrug: async (payload: any) => {
      return await axiosInstance
        .put(`${baseUrlApimaDrug}/${payload.id}`, payload)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          throw err;
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

    receiveMaDrug: async (payload: any) => {
      const { id, ...data } = payload;
      return await axiosInstance
        .patch(`${baseUrlApimaDrug}/${id}/receive`, data)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
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

    deleteDrugItem: async (id: any) => {
      const response = await axiosInstance.delete(`${baseUrlApiDrug}/${id}`);
      return response.data;
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

    getDispenseQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApiDispense}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createDispense: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlApiDispense}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateDispense: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiDispense}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    editDispense: async (payload: any) => {
      return await axiosInstance
        .put(`${baseUrlApiDispense}/${payload.id}`, payload)
        .then((res) => res.data);
    },

    executeDispense: async (payload: any) => {
      // ✅ ส่ง payload ไปเป็น argument ที่ 2 ของ axios.patch
      return await axiosInstance
        .patch(`${baseUrlApiDispense}/${payload.id}/execute`, payload)
        .then((res) => res.data);
    },

    deleteDispense: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApiDispense}/${id}`)
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
