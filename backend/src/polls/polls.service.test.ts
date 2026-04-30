import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AvailabilitiesService } from 'src/availabilities/availabilities.service';
import { Availability } from 'src/availabilities/models/availability.entity';
import { Participant } from 'src/participants/models/participant.entity';
import { clearTestData, createTestDataSource } from 'test/test-db.helper';
import { DataSource, Repository } from 'typeorm';
import { Poll } from './models/poll.entity';
import { CreatePollDto, UpdatePollDto } from './models/polls.dto';
import { PollsService } from './polls.service';

describe('PollsService', () => {
  let service: PollsService;
  let pollRepository: Repository<Poll>;
  let participantRepository: Repository<Participant>;
  let availabilityRepository: Repository<Availability>;
  let dataSource: DataSource;
  let availabilitiesService: AvailabilitiesService

  beforeEach(async () => {
    dataSource = await createTestDataSource();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PollsService,
        {
          provide: getRepositoryToken(Poll),
          useValue: dataSource.getRepository(Poll),
        },
        {
          provide: getRepositoryToken(Participant),
          useValue: dataSource.getRepository(Participant),
        },
        {
          provide: getRepositoryToken(Availability),
          useValue: dataSource.getRepository(Availability),
        },
        {
          provide: AvailabilitiesService,
          useValue: { findCommonSlots: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PollsService>(PollsService);
    pollRepository = module.get<Repository<Poll>>(getRepositoryToken(Poll));
    participantRepository = module.get<Repository<Participant>>(getRepositoryToken(Participant));
    availabilityRepository = module.get<Repository<Availability>>(getRepositoryToken(Availability));
    availabilitiesService = module.get<AvailabilitiesService>(AvailabilitiesService);
  });

  afterEach(async () => {
    await clearTestData(dataSource);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('create', () => {
    it('should create a poll', async () => {
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0)
      const dateInTwoDays = new Date();
      dateInTwoDays.setDate(dateInTwoDays.getDate() + 2);
      dateInTwoDays.setHours(0, 0, 0, 0);
      const createDto: CreatePollDto = { name: 'Pierre Poll Jacques', start_date: todayDate, end_date: dateInTwoDays };

      const result = await service.create(createDto);

      const stored = await pollRepository.findOne({ where: { id: result.id } });
      expect(result.id).toBeDefined();
      expect(stored).toMatchObject({
        name: createDto.name,
        start_date: todayDate.toISOString().split('T')[0],
        end_date: dateInTwoDays.toISOString().split('T')[0],
        created_at: expect.any(Date)
      });
    });

    it('should throw BadRequestException if end_date is before start_date', async () => {
      const createDto: CreatePollDto = { name: 'Bad Poll', start_date: new Date(), end_date: new Date('2025-01-01') };

      const result = service.create(createDto);

      await expect(result).rejects.toThrow('Poll end date must be after start date');
    });

    it('should throw BadRequestException if start_date is in the past', async () => {
      const createDto: CreatePollDto = { name: 'Past Poll', start_date: new Date('2020-01-01') };

      const result = service.create(createDto);

      await expect(result).rejects.toThrow('Poll start date cannot be in the past');
    });
  });

  describe('findAll', () => {
    it('should return all polls', async () => {
      await pollRepository.save([
        { name: 'Poll 1' },
        { name: 'Poll 2' },
      ]);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result?.map((poll) => poll.name)).toEqual(expect.arrayContaining(['Poll 1', 'Poll 2']));
    });

    it('should return empty array when no polls exist', async () => {
      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOneComputed', () => {
    it('should return enriched poll with common slots', async () => {
      const poll = await pollRepository.save({ name: 'Pierre Poll Jacques' });
      const john = await participantRepository.save({ name: 'John', poll });
      const jane = await participantRepository.save({ name: 'Jane', poll });
      await availabilityRepository.save([
        {
          participant: john,
          slot: '{["2025-01-01 10:00:00+00", "2025-01-01 12:00:00+00")}'
        },
        {
          participant: jane,
          slot: '{["2025-01-01 11:00:00+00", "2025-01-01 13:00:00+00")}'
        },
      ]);
      jest.spyOn(availabilitiesService, 'findCommonSlots').mockResolvedValueOnce([{ count: 2, participants_names: ["Jane", "John"], start_date: new Date(), end_date: new Date() }])

      const result = await service.findOneComputed(poll.id);

      expect(result.participants).toHaveLength(2);
      expect(result.participants.map((participant) => participant.name)).toEqual(
        expect.arrayContaining(['John', 'Jane']),
      );
      expect(result.commonSlots).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            count: 2,
            participants_names: ['Jane', 'John'],
          }),
        ]),
      );
    });

    it('should throw NotFoundException if poll not found', async () => {
      const result = service.findOneComputed('abcd1234');

      await expect(result).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a poll', async () => {
      const updateDto: UpdatePollDto = { name: 'Updated Poll' };
      const poll = await pollRepository.save({ name: 'Old Poll' });

      const result = await service.update(poll.id, updateDto);

      const stored = await pollRepository.findOne({ where: { id: poll.id } });
      expect(result.name).toBe('Updated Poll');
      expect(stored?.name).toBe('Updated Poll');
    });

    it('should throw NotFoundException if poll not found', async () => {
      const updateDto: UpdatePollDto = { name: 'Updated Poll' };

      await expect(service.update('efgh5678', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a poll', async () => {
      const poll = await pollRepository.save({ name: 'Poll to remove' });

      await expect(service.remove(poll.id)).resolves.toBeUndefined();

      const stored = await pollRepository.findOne({ where: { id: poll.id } });
      expect(stored).toBeNull();
    });

    it('should throw NotFoundException if poll not found', async () => {
      const result = service.remove('efgh5678');

      await expect(result).rejects.toThrow(NotFoundException);
    });
  });
});
