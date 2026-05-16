import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        throw new BadRequestException({
          message: 'Validation failed',
          errors: validationError.details.map(
            (d: { path: (string | number)[]; message: string }) => ({
              path: d.path.join('.'),
              message: d.message,
            }),
          ),
        });
      }
      throw error;
    }
  }
}
