// src/storage/storage.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from './storage.service';

export class SetStorageDto {
  key: string;
  value: string;
  ttl?: number;
}

@Controller('chat-sessions/storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Get storage item for a session
   * GET /chat-sessions/storage/:sessionId/:key
   */
  @Get(':sessionId/:key')
  async getItem(
    @Param('sessionId') sessionId: string,
    @Param('key') key: string,
  ) {
    const value = await this.storageService.getItem(sessionId, key);

    if (value === null) {
      throw new NotFoundException(`Storage item not found for key: ${key}`);
    }

    return { value };
  }

  /**
   * Set storage item for a session
   * POST /chat-sessions/storage/:sessionId
   */
  @Post(':sessionId')
  async setItem(
    @Param('sessionId') sessionId: string,
    @Body() dto: SetStorageDto,
  ) {
    await this.storageService.setItem(
      sessionId,
      dto.key,
      dto.value,
      dto.ttl || 900,
    );

    return {
      success: true,
      message: 'Storage item saved successfully',
    };
  }

  /**
   * Delete storage item for a session
   * DELETE /chat-sessions/storage/:sessionId/:key
   */
  @Delete(':sessionId/:key')
  async deleteItem(
    @Param('sessionId') sessionId: string,
    @Param('key') key: string,
  ) {
    await this.storageService.deleteItem(sessionId, key);

    return {
      success: true,
      message: 'Storage item deleted successfully',
    };
  }

  /**
   * Clear all storage items for a session
   * DELETE /chat-sessions/storage/:sessionId
   */
  @Delete(':sessionId')
  async clearSession(@Param('sessionId') sessionId: string) {
    const deletedCount = await this.storageService.clearSession(sessionId);

    return {
      success: true,
      message: `Cleared ${deletedCount} storage items`,
      deletedCount,
    };
  }
}
