import { Test, TestingModule } from '@nestjs/testing';
import { AbsensiService } from './absensi.service';

describe('AbsensiService', () => {
  let service: AbsensiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AbsensiService],
    }).compile();

    service = module.get<AbsensiService>(AbsensiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
