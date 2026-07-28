import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadImageToCloudinary } from '../config/services';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Upload single or multiple images
router.post('/', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No image files uploaded.' });
    }

    const uploadedUrls: string[] = [];
    for (const file of files) {
      const url = await uploadImageToCloudinary(file.buffer, 'prem_dhaga_products');
      uploadedUrls.push(url);
    }

    return res.status(200).json({ urls: uploadedUrls, url: uploadedUrls[0] });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return res.status(500).json({ error: error.message || 'Image upload failed' });
  }
});

export default router;
