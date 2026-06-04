// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';

import {
  requestStudentRoomFavoriteSet,
  requestStudentRoomFavorites
} from '../../../src/App';
import { successfulStudentRoomFavoritesResponse } from '../helpers/api-responses';

describe('student room favorites api', () => {
  it('学生自习室收藏列表请求会携带学生 token', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(successfulStudentRoomFavoritesResponse(['room-gm-301']));

    const summary = await requestStudentRoomFavorites(
      'student-token',
      fetcher,
      'http://xmwhzl.love:13000'
    );

    expect(fetcher).toHaveBeenCalledWith(
      'http://xmwhzl.love:13000/api/v1/favorites/me/rooms',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer student-token' },
        method: 'GET'
      })
    );
    expect(summary.favoriteRoomIds).toEqual(['room-gm-301']);
  });

  it('学生切换自习室收藏会持久化到服务端', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(successfulStudentRoomFavoritesResponse(['room-gm-301']))
      .mockResolvedValueOnce(successfulStudentRoomFavoritesResponse([]));

    await expect(
      requestStudentRoomFavoriteSet(
        'student-token',
        'room-gm-301',
        true,
        fetcher,
        'http://xmwhzl.love:13000'
      )
    ).resolves.toEqual(
      expect.objectContaining({
        favoriteRoomIds: ['room-gm-301']
      })
    );

    await expect(
      requestStudentRoomFavoriteSet(
        'student-token',
        'room-gm-301',
        false,
        fetcher,
        'http://xmwhzl.love:13000'
      )
    ).resolves.toEqual(
      expect.objectContaining({
        favoriteRoomIds: []
      })
    );

    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      'http://xmwhzl.love:13000/api/v1/favorites/me/rooms/room-gm-301',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer student-token' },
        method: 'PUT'
      })
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      'http://xmwhzl.love:13000/api/v1/favorites/me/rooms/room-gm-301',
      expect.objectContaining({
        credentials: 'include',
        headers: { Authorization: 'Bearer student-token' },
        method: 'DELETE'
      })
    );
  });
});
