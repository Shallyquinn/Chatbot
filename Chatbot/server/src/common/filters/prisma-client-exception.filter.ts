import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = exception.code === 'P2002' ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;

    response.status(status).json({
      success: false,
      message: exception.message,
      code: exception.code,
      meta: exception.meta,
    });
  }
}