// @story US2.1.1
// @tc TC-US2.1.1-03
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { RoomsModule } from '../../../src/rooms/rooms.module';

describe('RoomsModule', () => {
  it('能完成依赖注入编译，供 rooms 控制器使用认证与权限守卫', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), RoomsModule]
    }).compile();

    await moduleRef.close();
  });
});
