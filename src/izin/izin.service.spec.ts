import { Test, TestingModule } from '@nestjs/testing';
import { IzinService } from './izin.service';

describe('IzinService', () => {
  let service: IzinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IzinService],
    }).compile();

    service = module.get<IzinService>(IzinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
