import { AxiosInstance } from "axios";

export const userService = (axiosInstance: AxiosInstance) => {
  const baseUrlApiUser = "/user";
  return {
    requestOtp: async (body: { username: string; contact: string }) => {
      return await axiosInstance
        .post(`${baseUrlApiUser}/forgot-password/request-otp`, body)
        .then((res) => res.data)
        .catch((err) => {
          throw err;
        });
    },

    verifyOtp: async (body: { username: string; otp: string }) => {
      return await axiosInstance
        .post(`${baseUrlApiUser}/forgot-password/verify-otp`, body)
        .then((res) => res.data)
        .catch((err) => {
          throw err;
        });
    },

    // 3. เปลี่ยนรหัสผ่านใหม่
    resetPassword: async (body: {
      newPassword: string;
      resetToken: string;
    }) => {
      return await axiosInstance
        .post(`${baseUrlApiUser}/forgot-password/reset`, body)
        .then((res) => res.data)
        .catch((err) => {
          throw err;
        });
    },

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

    createUser: async (body: any) => {
      console.log(body);
      return await axiosInstance
        .post(`${baseUrlApiUser}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateUser: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiUser}/${body.userId}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    changePassword: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiUser}/change-password/${body.userId}`, body, {
          validateStatus: (status) => {
            return (status >= 200 && status < 300) || status === 400;
          },
        })
        .then((res) => {
          if (res.status === 400) {
            return { error: true, status: 400, message: "Bad Request" };
          }
          return res.data;
        })
        .catch((err) => {
          throw err;
        });
    },

    deleteUser: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApiUser}/${id}`)
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
