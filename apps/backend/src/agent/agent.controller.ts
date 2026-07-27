import { Controller, Get } from "@nestjs/common";
import { AgentService } from "./agent.service";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("agent")
@ApiBearerAuth()
@Controller("agent")
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get("info")
  getAgentInfo() {
    return this.agentService.getAgentInfo();
  }
}
