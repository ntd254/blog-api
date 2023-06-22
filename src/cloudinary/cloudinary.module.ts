import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ConfigurableModuleClass } from './cloudinary.module-definition';

@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule extends ConfigurableModuleClass {}
