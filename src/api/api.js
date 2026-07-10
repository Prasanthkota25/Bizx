import axios from "axios";

const DEFAULT_BASE = process.env.REACT_APP_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080" : "/api");

const API = axios.create({
  baseURL: DEFAULT_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: false
});

export function setApiBase(url) {
  API.defaults.baseURL = url;
}

export default API;