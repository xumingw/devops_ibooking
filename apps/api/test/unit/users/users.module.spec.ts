// @story US1.2.1
// @tc TC-US1.2.1-01
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { UsersModule } from '../../../src/users/users.module';

describe('UsersModule', () => {
  it('能完成依赖注入编译，供 users 控制器使用认证与权限守卫', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), UsersModule]
    }).compile();

    await moduleRef.close();
  });
});
