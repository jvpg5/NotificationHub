import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { RulesRegistry } from './rules.registry';
import { RulesService } from './rules.service';
import { Rule } from './interfaces/rule.interface';
import { AirTemperatureRule } from './rules/air-temperature.rule';
import { AirHumidityRule } from './rules/air-humidity.rule';
import { SoilMoistureRule } from './rules/soil-moisture.rule';
import { WaterReservoirLevelRule } from './rules/water-reservoir-level.rule';
import { SiloLevelRule } from './rules/silo-level.rule';
import { EquipmentStatusRule } from './rules/equipment-status.rule';

const RULES = 'RULES';

@Module({
  providers: [
    RulesRegistry,
    RulesService,
    {
      provide: RULES,
      useFactory: (): Rule[] => [
        new AirTemperatureRule(),
        new AirHumidityRule(),
        new SoilMoistureRule(),
        new WaterReservoirLevelRule(),
        new SiloLevelRule(),
        new EquipmentStatusRule(),
      ],
    },
  ],
})
export class RulesModule implements OnModuleInit {
  constructor(
    private readonly registry: RulesRegistry,
    @Inject(RULES) private readonly rules: Rule[],
  ) {}

  onModuleInit() {
    this.rules.forEach((rule) => this.registry.register(rule));
  }
}