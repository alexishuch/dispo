import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AvailabilitiesService } from 'src/availabilities/availabilities.service';
import { Repository } from 'typeorm';
import { Poll } from './models/poll.entity';
import { CreatePollDto, UpdatePollDto } from './models/polls.dto';
import { IPoll, IPollEnriched } from './models/polls.interface';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
    private readonly availabilitiesService: AvailabilitiesService
  ) { }

  async create(createPollDto: CreatePollDto): Promise<IPoll> {
    if (createPollDto.start_date) {
      const todayDateString = new Date().toISOString().split('T')[0];
      const startDateString = createPollDto.start_date.toISOString().split('T')[0];
      if (startDateString < todayDateString) {
        throw new BadRequestException('Poll start date cannot be in the past');
      }
      if (createPollDto.end_date && createPollDto.end_date < createPollDto.start_date) {
        throw new BadRequestException('Poll end date must be after start date');
      }
    }

    return this.pollRepository.save(createPollDto);
  }

  async findAll(): Promise<IPoll[] | null> {
    return this.pollRepository.find();
  }

  async findOneComputed(id: string): Promise<IPollEnriched> {
    const poll = await this.pollRepository.findOne({
      where: { id },
      relations: { participants: true },
    });
    if (!poll) throw new NotFoundException('Poll not found');
    const commonSlots = await this.availabilitiesService.findCommonSlots(id);
    console.log(commonSlots)
    return {
      ...poll,
      commonSlots,
    };
  }

  async update(id: string, updatePollDto: UpdatePollDto): Promise<IPoll> {
    const poll = await this.pollRepository.findOne({ where: { id } });
    if (!poll) throw new NotFoundException('Poll not found');
    this.pollRepository.merge(poll, updatePollDto);
    return this.pollRepository.save(poll);
  }

  async remove(id: string): Promise<void> {
    const poll = await this.pollRepository.findOne({ where: { id } });
    if (!poll) throw new NotFoundException('Poll not found');
    await this.pollRepository.remove(poll);
  }
}
