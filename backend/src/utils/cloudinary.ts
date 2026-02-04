import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const logoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'logos',
        allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
    } as any,
});

export const bannerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'banners',
        allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
        transformation: [{ width: 1920, height: 1080, crop: 'limit' }],
    } as any,
});

export const documentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'documents',
        allowed_formats: ['pdf', 'jpg', 'png', 'jpeg'],
        resource_type: 'raw', // Support non-image files like PDF
    } as any,
});

export default cloudinary;
