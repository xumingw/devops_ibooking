import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../database/prisma.service';
import { FavoritesController } from './favorites.controller';
import { FAVORITES_REPOSITORY, FavoritesService } from './favorites.service';
import { PrismaFavoritesRepository } from './prisma-favorites.repository';

@Module({
  imports: [AuthModule],
  controllers: [FavoritesController],
  providers: [
    PrismaService,
    FavoritesService,
    PrismaFavoritesRepository,
    {
      provide: FAVORITES_REPOSITORY,
      useExisting: PrismaFavoritesRepository
    }
  ]
})
export class FavoritesModule {}
