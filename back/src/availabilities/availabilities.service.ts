import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { deserializeAvailability, formatDateToPGSlotRange } from 'src/availabilities/date.tools';
import { Participant } from 'src/participants/models/participant.entity';
import { ICommonSlot } from 'src/polls/models/polls.interface';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateAvailabilityDto } from './models/availabilities.dto';
import { IAvailability } from './models/availabilities.interface';
import { Availability } from './models/availability.entity';

@Injectable()
export class AvailabilitiesService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
  ) { }

  async create(createAvailabilityDto: CreateAvailabilityDto): Promise<IAvailability> {
    const participant = await this.participantRepository.findOne({ where: { id: createAvailabilityDto.participantId }, relations: ['poll'] });
    if (!participant) throw new NotFoundException('Participant not found');
    const poll = participant.poll;

    const { slot_start, slot_end } = createAvailabilityDto;
    if (slot_end <= slot_start) {
      throw new BadRequestException('Availability slot end date must be after start date');
    }

    if (slot_start < new Date()) {
      throw new BadRequestException('Availability slot cannot start in the past');
    }

    if (poll.start_date) {
      const pollStartDate = new Date(poll.start_date); // TypeORM returns type "date" as strings
      if (slot_start < pollStartDate) {
        throw new BadRequestException(`Availability slot must start on or after poll start date (${pollStartDate.toLocaleDateString()})`);
      }
    }

    if (poll.end_date) {
      const pollEndDate = new Date(poll.end_date); // TypeORM returns type "date" as strings
      const pollEndDateEnd = new Date(pollEndDate.getFullYear(), pollEndDate.getMonth(), pollEndDate.getDate(), 23, 59, 59, 999);
      if (slot_end > pollEndDateEnd) {
        throw new BadRequestException(`Availability slot must end on or before poll end date (${pollEndDateEnd.toLocaleDateString()})`);
      }
    }

    const availability = new Availability();
    availability.slot = formatDateToPGSlotRange(createAvailabilityDto.slot_start, createAvailabilityDto.slot_end);
    availability.participant = participant;

    try {
      const savedAvailability = await this.availabilityRepository.save(availability);
      // Slots are stored as ranges in Postgres, need to deserialize before returning
      return deserializeAvailability(savedAvailability, true);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === '23P01'
      ) {
        throw new ConflictException('Participant already has an overlapping or identical slot');
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<IAvailability> {
    const availability = await this.availabilityRepository.findOne({ where: { id }, relations: ['participant'] });
    if (!availability) throw new NotFoundException('Availability not found');
    return deserializeAvailability(availability, true);
  }

  async findCommonSlots(pollId: string): Promise<ICommonSlot[]> {
    // 1. Get all availability slots for participants in the poll
    // 2. Create boundary points from all slots
    // 3. Filter the last boundary if it has no upper bound
    // 4. Create segments between each pair of boundary points
    // 5. For each segment, join with participant ranges to see which participants have availability overlapping with the segment. Keep only segments with 2+ participants.
    // 6. Display the segments with start_date, end_date, count of participants, and list of participant names

    const sql = `
WITH participant_ranges AS (
  SELECT p.id AS participant_id, p.name AS participant_name, slot
  FROM "Availabilities" a
  JOIN "Participants" p ON a.participant_id = p.id
  WHERE p.poll_id = $1
),
bounds AS (
  SELECT lower(slot) AS b FROM participant_ranges
  UNION
  SELECT upper(slot) AS b FROM participant_ranges
),
ordered_bounds AS (
  SELECT b, lead(b) OVER (ORDER BY b) AS next_b
  FROM bounds
),
ordered_bounds_filtered AS (
  SELECT b, next_b
  FROM ordered_bounds
  WHERE next_b IS NOT NULL
),
segments AS (
  SELECT tsrange(b, next_b) AS seg
  FROM ordered_bounds_filtered
),
segment_participants AS (
  SELECT
    seg,
    ARRAY_AGG(DISTINCT pr.participant_name ORDER BY pr.participant_name) AS participants_names,
    COUNT(DISTINCT pr.participant_id) AS count
  FROM segments s
  LEFT JOIN participant_ranges pr ON pr.slot && s.seg
  GROUP BY seg
  HAVING COUNT(DISTINCT pr.participant_id) >= 2
)
SELECT
  MIN(lower(seg)) AS start_date,
  MAX(upper(seg)) AS end_date,
  MAX(count) AS count,
  participants_names
FROM segment_participants
GROUP BY seg, participants_names
ORDER BY count DESC, start_date;
`;
    return this.availabilityRepository.query(sql, [pollId]);
  }

  async remove(id: string): Promise<void> {
    const availability = await this.availabilityRepository.findOne({ where: { id } });
    if (!availability) throw new NotFoundException('Availability not found');
    await this.availabilityRepository.remove(availability);
  }
}
