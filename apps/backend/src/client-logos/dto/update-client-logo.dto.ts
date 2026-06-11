import { PartialType } from '@nestjs/mapped-types';
import { CreateClientLogoDto } from './create-client-logo.dto';

export class UpdateClientLogoDto extends PartialType(CreateClientLogoDto) {}
