import { Injectable } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { File, UploadedFileResponse } from '../interfaces/file.interface';

@Injectable()
export class FileStorageService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadsDirExists();
  }

  private ensureUploadsDirExists() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: File): Promise<UploadedFileResponse> {
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname}`;
    const filePath = join(this.uploadDir, filename);
    
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      
      writeStream.on('finish', () => {
        resolve({
          filename,
          path: `/uploads/${filename}`,
          mimetype: file.mimetype,
          size: file.size,
        });
      });
      
      writeStream.on('error', (error) => {
        reject(error);
      });
      
      writeStream.write(file.buffer);
      writeStream.end();
    });
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}
