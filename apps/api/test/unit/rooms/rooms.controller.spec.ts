// @story US2.1.1
// @tc TC-US2.1.1-04
import 'reflect-metadata';
import { REQUIRED_PERMISSIONS_KEY } from '../../../src/auth/permissions.decorator';
import { RoomsController } from '../../../src/rooms/rooms.controller';

describe('RoomsController permissions', () => {
  it('统一房间读接口只要求登录，写接口继续要求后台写权限', () => {
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, RoomsController.prototype.listRooms)).toBeUndefined();
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, RoomsController.prototype.listCatalog)).toBeUndefined();
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, RoomsController.prototype.getAvailability)).toBeUndefined();
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, RoomsController.prototype.createRoom)).toEqual([
      'room.write'
    ]);
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, RoomsController.prototype.updateRoom)).toEqual([
      'room.write'
    ]);
  });
});
