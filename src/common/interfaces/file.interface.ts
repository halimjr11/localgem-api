import { Express } from 'express';

export interface File extends Express.Multer.File {}

export interface UploadedFileResponse {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}
