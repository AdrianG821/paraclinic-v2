import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';

type PrismaLikeError = {
  code?: string
  meta?: any
}


@Catch()
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    if (typeof exception !== 'object' || exception === null || !('code' in exception)) {
      throw exception
    }

    const prismaError = exception as PrismaLikeError

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';

    switch (prismaError.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT; // 409
        const target = Array.isArray(prismaError.meta?.target)
          ? prismaError.meta?.target.join(', ')
          : prismaError.meta?.target;
        message = target
          ? `Unique constraint failed on: ${target}`
          : 'Unique constraint failed';
        break;
      }

      case 'P2025': {
        status = HttpStatus.NOT_FOUND; // 404
        message = 'Record not found';
        break;
      }

      case 'P2003': {
        // FK constraint
        status = HttpStatus.BAD_REQUEST; // 400 (sau 422, după preferință)
        message = 'Foreign key constraint failed';
        break;
      }

      default: {
        // păstrează fallback generic, dar NU expune detalii sensibile
        message = `Prisma error ${prismaError.code}`;
      }
    }

    res.status(status).json({
      statusCode: status,
      message,
      code: exception.code,
      // meta poate ajuta la debug în dev; în prod poți omite
      meta: prismaError.meta ?? null,
    });
  }
}
