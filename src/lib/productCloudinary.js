import { v2 as cloudinary } from "cloudinary";

import { config } from "dotenv";

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME_Products,
  api_key: process.env.CLOUDINARY_API_KEY_Products,
  api_secret: process.env.CLOUDINARY_API_SECRET_Products,
  secure: true,
});

export default cloudinary;
