import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailsService {
  private transport: Mail;

  constructor(private config: ConfigService) {
    this.transport = createTransport({
      service: config.get('EMAIL_SERVICE'),
      auth: {
        user: config.get('EMAIL'),
        pass: config.get('EMAIL_PW'),
      },
    });
  }

  sendMail(options: Mail.Options) {
    return this.transport.sendMail(options);
  }
}
