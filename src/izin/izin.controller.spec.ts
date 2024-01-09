import { Test, TestingModule } from '@nestjs/testing';
import { IzinController } from './izin.controller';

describe('IzinController', () => {
  let controller: IzinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IzinController],
    }).compile();

    controller = module.get<IzinController>(IzinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
