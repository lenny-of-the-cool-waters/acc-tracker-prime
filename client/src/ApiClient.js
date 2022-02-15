// Module importations
import axios from 'axios';

const ApiClient = axios.create({
    withCredentials: true,
    baseUrl: process.env.REACT_APP_BACKEND,
    exposedHeaders: ["set-cookie"]
})

export default ApiClient;