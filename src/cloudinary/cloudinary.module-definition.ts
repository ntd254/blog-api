import { ConfigurableModuleBuilder } from '@nestjs/common';

export interface CloudinaryModuleOptions {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<CloudinaryModuleOptions>()
    .setClassMethodName('forRoot')
    .build();
