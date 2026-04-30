import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participant } from 'src/participants/models/participant.entity';
import { AvailabilitiesController } from './availabilities.controller';
import { AvailabilitiesService } from './availabilities.service';
import { Availability } from './models/availability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Availability, Participant])],
  controllers: [AvailabilitiesController],
  providers: [AvailabilitiesService],
  exports: [AvailabilitiesService]
})
export class AvailabilitiesModule { }
