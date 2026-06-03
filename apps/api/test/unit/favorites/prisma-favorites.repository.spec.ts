import { PrismaFavoritesRepository } from '../../../src/favorites/prisma-favorites.repository';
import { PrismaService } from '../../../src/database/prisma.service';

describe('PrismaFavoritesRepository', () => {
  let prisma: {
    favorite: {
      findMany: jest.Mock;
      upsert: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let repository: PrismaFavoritesRepository;

  beforeEach(() => {
    prisma = {
      favorite: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn()
      }
    };
    repository = new PrismaFavoritesRepository(prisma as unknown as PrismaService);
  });

  it('按当前学生查询收藏自习室并保留收藏顺序', async () => {
    prisma.favorite.findMany.mockResolvedValue([
      {
        id: 'favorite-stu-gm-301',
        userId: 'user-stu-cse-01',
        roomId: 'room-gm-301',
        createdAt: new Date('2026-05-30T06:00:00.000Z'),
        room: { id: 'room-gm-301', name: '经管自习室 301' }
      }
    ]);

    await expect(repository.listRoomFavorites('user-stu-cse-01')).resolves.toEqual({
      favoriteRoomIds: ['room-gm-301'],
      favorites: [{ roomId: 'room-gm-301', room: '经管自习室 301' }]
    });

    expect(prisma.favorite.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-stu-cse-01' },
      include: {
        room: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  });

  it('收藏自习室使用用户和房间唯一键避免重复', async () => {
    prisma.favorite.upsert.mockResolvedValue({});

    await repository.addRoomFavorite('user-stu-cse-01', 'room-gm-301');

    expect(prisma.favorite.upsert).toHaveBeenCalledWith({
      where: {
        userId_roomId: {
          userId: 'user-stu-cse-01',
          roomId: 'room-gm-301'
        }
      },
      update: {},
      create: {
        userId: 'user-stu-cse-01',
        roomId: 'room-gm-301'
      }
    });
  });

  it('取消收藏只删除当前学生当前自习室', async () => {
    prisma.favorite.deleteMany.mockResolvedValue({ count: 1 });

    await repository.removeRoomFavorite('user-stu-cse-01', 'room-gm-301');

    expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-stu-cse-01',
        roomId: 'room-gm-301'
      }
    });
  });
});
