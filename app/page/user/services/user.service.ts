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

    changePassword: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiUser}/change-password/${body.userId}`, body, {
          // [แก้ไขจุดที่ 1] เพิ่ม config นี้เพื่อบอกว่า 400 ไม่ใช่ Error
          validateStatus: (status) => {
            // ยอมรับ Status 200-299 และยอมรับ 400 ด้วย
            return (status >= 200 && status < 300) || status === 400;
          },
        })
        .then((res) => {
          // [แก้ไขจุดที่ 2] เช็คเองว่าถ้าเป็น 400 ให้ส่ง flag บอกหน้าบ้าน
          if (res.status === 400) {
            return { error: true, status: 400, message: "Bad Request" };
          }
          // ถ้าเป็น 200 ก็ส่ง data ปกติ
          return res.data;
        })
        .catch((err) => {
          // ตรงนี้จะทำงานเฉพาะ Error อื่นๆ (เช่น 404, 500 หรือ Network Error)
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
