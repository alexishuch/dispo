import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { deserializeAvailability } from 'src/availabilities/date.tools';
import { Poll } from 'src/polls/models/poll.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { Participant } from './models/participant.entity';
import { CreateParticipantDto, UpdateParticipantDto } from './models/participants.dto';
import { ICreatedParticipant, IParticipant, IParticipantWithAvailabilities } from './models/participants.interface';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>,
  ) { }

  async create(createParticipantDto: CreateParticipantDto): Promise<ICreatedParticipant> {
    const participant = new Participant();
    participant.name = createParticipantDto.name;

    const poll = await this.pollRepository.findOne({ where: { id: createParticipantDto.pollId } });
    if (!poll) throw new NotFoundException('Poll not found');
    participant.poll = poll;

    try {
      const { id, name, poll } = await this.participantRepository.save(participant);
      return { id, name, pollId: poll.id };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === '23505'
      ) {
        throw new ConflictException('Participant violates a unique constraint');
      }
      throw error;
    }
  }

  async findAll(): Promise<Participant[]> {
    return this.participantRepository.find({ relations: ['poll'] });
  }

  async findOne(id: string): Promise<IParticipantWithAvailabilities> {
    const participant = await this.participantRepository.findOne({ where: { id }, relations: ['poll', 'availabilities'] });
    if (!participant) throw new NotFoundException('Participant not found');
    return { ...participant, availabilities: participant.availabilities.map((a) => deserializeAvailability(a)) };
  }

  async update(id: string, updateParticipantDto: UpdateParticipantDto): Promise<IParticipant> {
    const participant = await this.participantRepository.findOne({ where: { id } });
    if (!participant) throw new NotFoundException('Participant not found');
    this.participantRepository.merge(participant, updateParticipantDto);

    try {
      await this.participantRepository.save(participant);
      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === '23505'
      ) {
        throw new ConflictException('Participant violates a unique constraint');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const participant = await this.participantRepository.findOne({ where: { id } });
    if (!participant) throw new NotFoundException('Participant not found');
    await this.participantRepository.remove(participant);
  }
}
