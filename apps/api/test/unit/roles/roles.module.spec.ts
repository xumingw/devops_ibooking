// @story US1.3.1
// @tc TC-US1.3.1-01
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { RolesModule } from '../../../src/roles/roles.module';

describe('RolesModule', () => {
  it('能完成依赖注入编译，供 roles 控制器使用认证与权限守卫', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), RolesModule]
    }).compile();

    await moduleRef.close();
  });
});
