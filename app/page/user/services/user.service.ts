import { AxiosInstance } from "axios";

export const userService = (axiosInstance: AxiosInstance) => {
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
