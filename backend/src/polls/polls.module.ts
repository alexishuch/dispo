import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilitiesModule } from 'src/availabilities/availabilities.module';
import { Availability } from 'src/availabilities/models/availability.entity';
import { Participant } from 'src/participants/models/participant.entity';
import { Poll } from './models/poll.entity';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, Participant, Availability]), AvailabilitiesModule],
  controllers: [PollsController],
  providers: [PollsService],
})
export class PollsModule { }
