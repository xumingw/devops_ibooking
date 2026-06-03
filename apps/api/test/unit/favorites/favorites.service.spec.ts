import { StudentRoomFavoriteSummary } from '@ibooking/shared-types';
import { FavoritesRepository, FavoritesService } from '../../../src/favorites/favorites.service';

describe('FavoritesService', () => {
  let repository: jest.Mocked<FavoritesRepository>;
  let service: FavoritesService;

  beforeEach(() => {
    repository = {
      listRoomFavorites: jest.fn(),
      addRoomFavorite: jest.fn(),
      removeRoomFavorite: jest.fn()
    };
    service = new FavoritesService(repository);
  });

  it('汇总当前学生收藏自习室', async () => {
    const summary: StudentRoomFavoriteSummary = {
      favoriteRoomIds: ['room-gm-301'],
      favorites: [{ roomId: 'room-gm-301', room: '经管自习室 301' }]
    };
    repository.listRoomFavorites.mockResolvedValue(summary);

    await expect(service.getStudentRoomFavorites('user-stu-cse-01')).resolves.toEqual(summary);
    expect(repository.listRoomFavorites).toHaveBeenCalledWith('user-stu-cse-01');
  });

  it('收藏自习室后返回重新汇总后的收藏列表', async () => {
    const summary: StudentRoomFavoriteSummary = {
      favoriteRoomIds: ['room-gm-301', 'room-science-403'],
      favorites: [
        { roomId: 'room-gm-301', room: '经管自习室 301' },
        { roomId: 'room-science-403', room: '理工自习室 403' }
      ]
    };
    repository.listRoomFavorites.mockResolvedValue(summary);

    await expect(
      service.addStudentRoomFavorite('user-stu-cse-01', 'room-science-403')
    ).resolves.toEqual(summary);

    expect(repository.addRoomFavorite).toHaveBeenCalledWith('user-stu-cse-01', 'room-science-403');
    expect(repository.listRoomFavorites).toHaveBeenCalledWith('user-stu-cse-01');
  });

  it('取消收藏自习室后返回重新汇总后的收藏列表', async () => {
    const summary: StudentRoomFavoriteSummary = {
      favoriteRoomIds: [],
      favorites: []
    };
    repository.listRoomFavorites.mockResolvedValue(summary);

    await expect(
      service.removeStudentRoomFavorite('user-stu-cse-01', 'room-gm-301')
    ).resolves.toEqual(summary);

    expect(repository.removeRoomFavorite).toHaveBeenCalledWith('user-stu-cse-01', 'room-gm-301');
    expect(repository.listRoomFavorites).toHaveBeenCalledWith('user-stu-cse-01');
  });
});
