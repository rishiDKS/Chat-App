import axios from "axios";

//use this whenever we are doing a request
export const axiosInstance=axios.create({
    baseURL:import.meta.env.MODE=="development"?"http://localhost:3000/api": "/api",
    withCredentials:true,
});