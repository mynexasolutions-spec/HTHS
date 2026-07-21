"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryUploader = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
require('dotenv').config();

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('[cloudinary] Missing CLOUDINARY_* env variables');
}

cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

exports.cloudinaryUploader = {
    async uploadPdf(buffer, filename) {
        const publicId = `resumes/${filename.replace(/\.[^.]+$/, '')}-${Date.now()}`;
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({ resource_type: 'raw', public_id: publicId, format: 'pdf' }, (err, result) => {
                if (err || !result) {
                    reject(err || new Error('Cloudinary upload failed.'));
                    return;
                }
                resolve({ url: result.secure_url, public_id: result.public_id });
            });
            stream_1.Readable.from(buffer).pipe(uploadStream);
        });
    },
    async remove(publicId) {
        try {
            await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: 'raw' });
        }
        catch (err) {
            console.error('[cloudinary] delete failed:', err);
        }
    },
};