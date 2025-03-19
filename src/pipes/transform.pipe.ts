import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TransformPipe implements PipeTransform<any> {
  constructor(private readonly dto: any) {}

  transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    try {
      return plainToClass(this.dto, value, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Transform failed',
        error: error.message,
      });
    }
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
} 