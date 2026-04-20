import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/api', // Đường dẫn Backend của bạn
});

await axios.post(API, formData, {
  headers: { "Content-Type": "multipart/form-data" }
});

export default instance;