import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import * as compression from 'compression';
import * as fs from 'fs';
import * as morgan from 'morgan';
import * as path from 'path';

async function bootstrap() {
   let app: INestApplication;

   if (process.env.NODE_ENV === 'development') {

      const httpsOptions = {
         cert: fs.readFileSync(path.join(__dirname, '../.cert/cert.pem'), 'utf-8'),
         key: fs.readFileSync(path.join(__dirname, '../.cert/key.pem'), 'utf-8'),
      };

      app = await NestFactory.create(AppModule, {
         httpsOptions
      });

      app.use(morgan(':method :url :status - :response-time ms'));

   } else {

      // const server = express();
      app = await NestFactory.create(AppModule);
   }

   const config = app.get(ConfigService);
   app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));



   app.use(helmet());
   app.use(compression());

   app.use(cookieParser());

   const corsOrigins = config.get<string>('CORS_ORIGINS').split(',');

   app.enableCors({
      origin: corsOrigins,
      credentials: true,
      methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE', 'PATCH'],
      allowedHeaders: ['Origin', 'Content-Type', 'Authorization', 'Access-Control'],
   });

   app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

   await app.listen(config.get('PORT', 3001));
}
bootstrap();
