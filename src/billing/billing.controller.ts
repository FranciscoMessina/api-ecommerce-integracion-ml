import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { MeliGuard } from '../auth/guards/meli-config.guard';
import { BillingService } from './billing.service';

@Controller('billing')
@UseGuards(JwtAuthGuard, MeliGuard)
export class BillingController {
   constructor(private readonly billingService: BillingService) { }
}
