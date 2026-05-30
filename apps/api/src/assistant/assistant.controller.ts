import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StudentAssistantReply } from '@ibooking/shared-types';
import { AuthenticatedRequest, AuthGuard } from '../auth/auth.guard';
import { SendAssistantMessageDto } from './assistant.dto';
import { AssistantService } from './assistant.service';

@ApiTags('assistant')
@Controller('api/v1/assistant')
@UseGuards(AuthGuard)
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('me/messages')
  sendMessage(
    @Req() request: AuthenticatedRequest,
    @Body() body: SendAssistantMessageDto
  ): Promise<StudentAssistantReply> {
    return this.assistantService.reply({
      userId: request.auth!.user.id,
      departmentId: request.auth!.user.departmentId,
      message: body.message
    });
  }
}
