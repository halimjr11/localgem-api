import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as hbs from 'hbs';
import { Request, Response, NextFunction } from 'express';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Set up static files and views directory
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  
  // Configure Handlebars
  const hbsInstance = require('hbs');
  
  // Register helpers
  hbsInstance.registerHelper('ifEquals', function(arg1: any, arg2: any, options: any) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
  });
  
  hbsInstance.registerHelper('eq', function(a: any, b: any) {
    return a === b;
  });
  
  hbsInstance.registerHelper('stringify', function(context: any) {
    return JSON.stringify(context, null, 2);
  });
  
  app.setViewEngine('hbs');
  
  // Set up CORS for development
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Set global prefix for all API routes
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  // Serve documentation at root
  app.use((req: Request, res: Response, next: NextFunction) => {
    // If the request is for the API, let it pass through
    if (req.originalUrl.startsWith('/api/')) {
      return next();
    }
    
    // For all other requests, serve the documentation
    if (req.originalUrl === '/' || req.originalUrl.startsWith('/css/')) {
      return next();
    }
    
    // Redirect all other non-API routes to the documentation
    res.redirect('/');
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation available at: http://localhost:${port}`);
  console.log(`API Endpoints available at: http://localhost:${port}/api/...`);
  
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

void bootstrap();
