import config from "@/config";
import axios from "axios";

export default axios.create({
  baseURL: config.backendUrl,
  headers: { "Content-Type": "application/json" },
});

export const axiosAuth = axios.create({
  baseURL: config.backendUrl,
  headers: { "Content-Type": "application/json" },
});
