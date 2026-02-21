import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller.js";
import { ReportingController } from "./reporting.controller.js";

@Module({
  controllers: [HealthController, ReportingController]
})
export class AppModule {}

