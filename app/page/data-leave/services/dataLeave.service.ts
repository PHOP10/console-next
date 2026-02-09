import { UploadResponse } from "@/app/common";
import { AxiosInstance } from "axios";

export const DataLeaveService = (axiosInstance: AxiosInstance) => {
  const baseUrlApiDataLeave = "/dataLeave";
  const baseUrlApiMasterLeave = "/masterLeave";
  const baseUrlApiUser = "/user";

  const FILE_BASE_URL =
    process.env.NEXT_PUBLIC_FILE_URL || "https://onm.arxencore.com";

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

    uploadDataLeaveFile: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append("file", file);

      return await axiosInstance
        .post<UploadResponse>(`${baseUrlApiDataLeave}/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          return res.data; // TypeScript จะรู้ทันทีว่า data คือ UploadResponse
        })
        .catch((err) => {
          console.error("Upload file error:", err);
          throw err; // โยน Error ออกไปให้หน้าบ้านจัดการ (ถูกต้องแล้ว)
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

    getFileUrl: (fileName: string) => {
      if (!fileName) return "";
      // ผลลัพธ์: https://onm.arxencore.com/uploads/data-leave/xxx.pdf
      return `${FILE_BASE_URL}/uploads/data-leave/${encodeURIComponent(fileName)}`;
    },
  };
};
