import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest() as Request;

  if (!req.user) throw new ForbiddenException('You are not logged in');

  return req.user;
});
