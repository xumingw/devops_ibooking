import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { AdminOverviewController } from '../../../src/admin-overview/admin-overview.controller';

describe('AdminOverviewController', () => {
  it('声明 Nest Controller 元数据，确保应用启动时能注册路由', () => {
    expect(Reflect.hasMetadata(PATH_METADATA, AdminOverviewController)).toBe(true);
    expect(
      Reflect.getMetadata(PATH_METADATA, AdminOverviewController.prototype.getOverview)
    ).toBe('/api/v1/admin/overview');
    expect(
      Reflect.getMetadata(METHOD_METADATA, AdminOverviewController.prototype.getOverview)
    ).toBe(0);
    expect(
      Reflect.getMetadata(PATH_METADATA, AdminOverviewController.prototype.listBookings)
    ).toBe('/api/v1/admin/bookings');
    expect(
      Reflect.getMetadata(METHOD_METADATA, AdminOverviewController.prototype.listBookings)
    ).toBe(0);
    expect(
      Reflect.getMetadata(PATH_METADATA, AdminOverviewController.prototype.listViolations)
    ).toBe('/api/v1/admin/violations');
    expect(
      Reflect.getMetadata(METHOD_METADATA, AdminOverviewController.prototype.listViolations)
    ).toBe(0);
  });
});
