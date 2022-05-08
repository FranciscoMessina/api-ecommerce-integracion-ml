import { Allow } from 'class-validator';
import { MeliNotificationTopic } from '../../types/meli.types';

export class MeliNotificationDto {
  @Allow()
  resource: string;

  @Allow()
  user_id: number;

  @Allow()
  topic: MeliNotificationTopic;

  @Allow()
  application_id: number;

  @Allow()
  attempts: number;

  @Allow()
  sent: Date;

  @Allow()
  received: Date;
}
