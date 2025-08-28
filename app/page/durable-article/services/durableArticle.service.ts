import { AxiosInstance } from "axios";

export const infectiousWasteServices = (axiosInstance: AxiosInstance) => {
  const baseUrlApidurableArticle = "/durableArticle";
  const baseUrlApiSupportingResource = "/supportingResource";
  return {
    getDurableArticleQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApidurableArticle}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createDurableArticle: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlApidurableArticle}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateDurableArticle: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApidurableArticle}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteDurableArticle: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApidurableArticle}/${id}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    getSupportingResourceQuery: async () => {
      return await axiosInstance
        .get(`${baseUrlApiSupportingResource}`)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    createSupportingResource: async (body: any) => {
      return await axiosInstance
        .post(`${baseUrlApiSupportingResource}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    updateSupportingResource: async (body: any) => {
      return await axiosInstance
        .patch(`${baseUrlApiSupportingResource}/${body.id}`, body)
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          return [];
        });
    },

    deleteSupportingResource: async (id: any) => {
      return await axiosInstance
        .delete(`${baseUrlApiSupportingResource}/${id}`)
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
