import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  CloudinaryModuleOptions,
  MODULE_OPTIONS_TOKEN,
} from './cloudinary.module-definition';
import { v2 as cloudinary } from 'cloudinary';
import { Express } from 'express';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(
    @Optional()
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: CloudinaryModuleOptions,
  ) {
    if (options) {
      cloudinary.config({
        cloud_name: options.cloudName,
        api_key: options.apiKey,
        api_secret: options.apiSecret,
      });
    }
  }

  async upload(base64Image: string) {
    const res = await cloudinary.uploader.upload(base64Image);
    return res.url;
  }

  async uploadStream(file: Express.Multer.File[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream((err, callResult) => {
        if (err) {
          return reject(err);
        }
        resolve(callResult.url);
      });
      Readable.from(file[0].buffer).pipe(upload);
    });
  }

  async deleteImageByUrl(imageUrls: string[]) {
    const publicIds = imageUrls.map((imageUrl) => {
      const imageName = imageUrl.split('/').at(-1);
      return imageName.slice(0, imageName.indexOf('.'));
    });
    console.log(publicIds);
    return publicIds.map((publicId) => cloudinary.uploader.destroy(publicId));
  }
}
