import { AxiosInstance } from "axios";

export const indexService = (axiosInstance: AxiosInstance) => {
  const baseUrlForgotPassword = "";

  return {
    requestOtp: async (body: { username: string; contact: string }) => {
      return await axiosInstance
        .post(`${baseUrlForgotPassword}/forgot-password/request-otp`, body)
        .then((res: any) => res.data) // <--- 2. เติม : any
        .catch((err: any) => {
          throw err;
        });
    },

    verifyOtp: async (body: { username: string; otp: string }) => {
      return await axiosInstance
        .post(`${baseUrlForgotPassword}/forgot-password/verify-otp`, body)
        .then((res: any) => res.data) // <--- เติม : any
        .catch((err: any) => {
          // <--- เติม : any
          throw err;
        });
    },

    resetPassword: async (body: {
      newPassword: string;
      resetToken: string;
    }) => {
      return await axiosInstance
        .post(`${baseUrlForgotPassword}/forgot-password/reset`, body)
        .then((res: any) => res.data) // <--- เติม : any
        .catch((err: any) => {
          // <--- เติม : any
          throw err;
        });
    },
  };
};
