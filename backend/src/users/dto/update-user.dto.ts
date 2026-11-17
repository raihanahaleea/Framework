// src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * Allows partial updates of a User.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}

