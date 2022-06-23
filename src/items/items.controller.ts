import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { MeliGuard } from '../auth/guards/meli-config.guard';
import { ItemsService } from './items.service';

@Controller('items')
@UseGuards(JwtAuthGuard, MeliGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}
}
