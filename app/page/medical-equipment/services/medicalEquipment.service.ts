import { AxiosInstance } from "axios";

export const maMedicalEquipmentServices = (axiosInstance: AxiosInstance) => {
  const baseUrlmaMedicalEquipment = "/maMedicalEquipment";
  const baseUrlmedicalEquipment = "/medicalEquipment";

  return {
    getMaMedicalEquipmentQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlmaMedicalEquipment}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createMaMedicalEquipment: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlmaMedicalEquipment}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateMaMedicalEquipment: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlmaMedicalEquipment}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateMedicalEquipmentEdit: async (body: any) => {
      const { id, ...data } = body;
      return await axiosInstance
        .patch(`${baseUrlmaMedicalEquipment}/Edit/${id}`, data)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteMaMedicalEquipment: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlmaMedicalEquipment}/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    getMedicalEquipmentQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlmedicalEquipment}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createMedicalEquipment: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlmedicalEquipment}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateMedicalEquipment: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlmedicalEquipment}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteMedicalEquipment: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlmedicalEquipment}/${id}`)
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
