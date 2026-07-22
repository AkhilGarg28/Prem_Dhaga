import { Request, Response } from 'express';
import { Content } from '../models/Content';

// Retrieve all CMS key-values
export const getAllCMSContent = async (req: Request, res: Response) => {
  try {
    const contents = await Content.find();
    const cmsMap: Record<string, any> = {};
    contents.forEach((c) => {
      cmsMap[c.key] = c.value;
    });
    return res.status(200).json(cmsMap);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Retrieve CMS content by key
export const getCMSContentByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const content = await Content.findOne({ key });
    if (!content) return res.status(404).json({ error: `CMS configuration not found for: ${key}` });
    return res.status(200).json(content.value);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Update CMS content by key (authorized admins)
export const updateCMSContentByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    let content = await Content.findOne({ key });
    if (content) {
      content.value = value;
      await content.save();
    } else {
      content = new Content({ key, value });
      await content.save();
    }

    return res.status(200).json({ message: 'CMS updated successfully', key, value: content.value });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Bulk update multiple CMS content key-values
export const bulkUpdateCMS = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    for (const [key, value] of Object.entries(payload)) {
      await Content.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
    }
    return res.status(200).json({ message: 'CMS bulk content updated successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
