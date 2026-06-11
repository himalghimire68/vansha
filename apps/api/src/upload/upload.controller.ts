import {
  Controller, Post, UseInterceptors, UploadedFile,
  BadRequestException, Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import { Request } from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const multer = require('multer');

interface MulterFile {
  originalname: string;
  mimetype: string;
  size: number;
  filename: string;
  path: string;
}

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private configService: ConfigService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a photo, get back a URL' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: (_req: Request, _file: MulterFile, cb: (err: Error | null, dest: string) => void) => {
          cb(null, join(process.cwd(), 'uploads'));
        },
        filename: (_req: Request, file: MulterFile, cb: (err: Error | null, name: string) => void) => {
          const unique = randomBytes(8).toString('hex');
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: MAX_SIZE_BYTES },
      fileFilter: (_req: Request, file: MulterFile, cb: (err: Error | null, accept: boolean) => void) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
          cb(new BadRequestException(`Unsupported file type: ${file.mimetype}`), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async upload(@UploadedFile() file: MulterFile, @Req() _req: Request) {
    if (!file) throw new BadRequestException('No file provided');

    const baseUrl =
      this.configService.get('NEXT_PUBLIC_API_URL') ||
      `http://localhost:${this.configService.get('API_PORT') || 3001}`;

    return { url: `${baseUrl}/uploads/${file.filename}` };
  }
}
