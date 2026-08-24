# NotificationHub — Planejamento Inicial

## 1. Decisão Tecnológica

### Stack Escolhida

| Camada | Tecnologia | Versão |
|---|---|---|
| Backend | NestJS | ^11.x |
| Frontend | React + Vite | ^19.x / ^6.x |
| Linguagem | TypeScript | ^5.x |
| ORM | Prisma | ^6.x |
| Banco de Dados | SQLite | 3.x |
| Validação | class-validator + class-transformer | ^0.14 / ^0.5 |
| Testes (backend) | Jest + @nestjs/testing | ^29.x |
| Testes (frontend) | Vitest + React Testing Library | ^3.x |
| Monorepo | pnpm workspaces | ^9.x |

### Justificativa

**NestJS** foi escolhido por:
- Arquitetura modular com injeção de dependência, ideal para separar o pipeline em módulos coesos (Events, Rules, Notifications, Providers).
- Pipes de validação com `class-validator` que validam eventos de entrada com decorators, equivalentes ao Pydantic do Python.
- Suporte nativo a eventos (`@nestjs/event-emitter`) para o pipeline desacoplado: `EventReceived → RuleEvaluated → NotificationGenerated → NotificationSent`.
- Testabilidade: `@nestjs/testing` permite mockar providers (ex: `MockWhatsAppProvider`) sem alterar lógica de negócio.
- Familiaridade da equipe: stack utilizada no trabalho atual, garantindo produtividade máxima.

**Vite + React** foi escolhido por:
- Build extremamente rápido (especialmente em monorepo com múltiplos pacotes).
- Perfeito para SPA — o dashboard de monitoramento não precisa de SSR.
- Proxy de desenvolvimento integrado para redirecionar `/api` ao NestJS.
- Ecossistema maduro com React Router, TanStack Query e Testing Library.

**SQLite + Prisma** foi escolhido por:
- Zero dependência externa — banco embedded, ideal para MVP.
- Prisma oferece type-safety, migrations e schema declarativo.
- SQLite atende perfeitamente ao volume de dados do MVP (eventos e notificações).

---

## 2. Arquitetura Geral

```
┌──────────────────────────────────────────────────────────────────┐
│                        pnpm monorepo                              │
│                                                                  │
│  ┌────────────────────────┐    ┌──────────────────────────────┐  │
│  │   apps/notification-hub│    │   apps/frontend              │  │
│  │   (NestJS - :3001)     │    │   (Vite + React - :5173)     │  │
│  │                        │    │                              │  │
│  │  POST /api/events      │◄──►│  Proxy: /api → :3001        │  │
│  │  GET  /api/events      │    │                              │  │
│  │  GET  /api/notifications│   │  / → Dashboard               │  │
│  │  GET  /api/farm        │    │  /simulator → Simulador      │  │
│  │  GET  /api/devices     │    │  /history → Histórico        │  │
│  └──────────┬─────────────┘    └──────────────────────────────┘  │
│             │                                                    │
│  ┌──────────▼─────────────┐                                      │
│  │   Prisma + SQLite      │                                      │
│  │   (prisma/dev.db)      │                                      │
│  └────────────────────────┘                                      │
│                                                                  │
│  ┌────────────────────────┐                                      │
│  │   packages/            │                                      │
│  │   - shared-types/      │  Tipos compartilhados (Event,        │
│  │   - rule-engine/       │  Notification, DTOs)                 │
│  └────────────────────────┘                                      │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

```
Sensor/Dispositivo/Simulador
        │
        ▼
  POST /api/events
        │
  ┌─────▼─────────────────────────────────────────────────────┐
  │                   NestJS — EventsModule                    │
  │                                                           │
  │  1. ValidationPipe (class-validator)                      │
  │     → Valida campos obrigatórios, tipos, unidades, ranges │
  │                                                           │
  │  2. IdempotencyGuard                                     │
  │     → Verifica se eventId já foi processado               │
  │     → Se duplicado: retorna 200 (já processado)           │
  │                                                           │
  │  3. EventService.processEvent(event)                      │
  │     → Emite evento 'event.received'                       │
  └───────────────────────────────────────────────────────────┘
        │
        ▼
  ┌───────────────────────────────────────────────────────────┐
  │              RulesModule (event emitter listener)          │
  │                                                           │
  │  Escuta: 'event.received'                                 │
  │                                                           │
  │  Para cada regra:                                         │
  │    AIR_TEMPERATURE > 35 → alerta temperatura              │
  │    AIR_HUMIDITY < 30    → alerta umidade baixa            │
  │    SOIL_MOISTURE < 20   → alerta irrigação                │
  │    WATER_RESERVOIR_LEVEL < 15 → alerta nível baixo        │
  │    SILO_LEVEL < 15      → alerta nível baixo              │
  │    EQUIPMENT_STATUS = FAILURE → alerta falha              │
  │                                                           │
  │  Se alguma regra acionada:                                │
  │    → Gera Notification com mensagem e severidade          │
  │    → Emite evento 'notification.generated'               │
  └───────────────────────────────────────────────────────────┘
        │
        ▼
  ┌───────────────────────────────────────────────────────────┐
  │          NotificationsModule (event emitter listener)      │
  │                                                           │
  │  Escuta: 'notification.generated'                         │
  │                                                           │
  │  1. Persiste notificação no banco (status: PENDING)       │
  │  2. Chama NotificationProvider.send(notification)         │
  │  3. Atualiza status (SENT | FAILED)                       │
  │  4. Emite evento 'notification.sent'                      │
  └───────────────────────────────────────────────────────────┘
        │
        ▼
  ┌───────────────────────────────────────────────────────────┐
  │        NotificationProvidersModule                         │
  │                                                           │
  │  Interface: NotificationProvider                          │
  │    ├── MockWhatsAppProvider (MVP — registra no banco)     │
  │    └── (futuro) WhatsAppBusinessProvider                   │
  │                                                           │
  │  MockWhatsAppProvider:                                    │
  │    → Marca notificação como SENT                          │
  │    → Registra timestamp de envio                          │
  │    → Loga a operação                                      │
  └───────────────────────────────────────────────────────────┘
```

---

## 3. Estrutura do Monorepo

```
notificationhub/
├── pnpm-workspace.yaml
├── package.json                 # Root scripts
├── tsconfig.base.json           # Base TS config
├── .env.example
├── PLANNING.md
├── DEVELOPMENT_LOG.md
├── README.md
├── LICENSE
│
├── apps/
│   ├── backend/                 # NestJS application
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── common/
│   │       │   ├── pipes/
│   │       │   │   └── validation.pipe.ts
│   │       │   ├── guards/
│   │       │   │   └── idempotency.guard.ts
│   │       │   ├── filters/
│   │       │   │   └── http-exception.filter.ts
│   │       │   └── interceptors/
│   │       │       └── logging.interceptor.ts
│   │       ├── events/
│   │       │   ├── events.module.ts
│   │       │   ├── events.controller.ts
│   │       │   ├── events.service.ts
│   │       │   ├── dto/
│   │       │   │   └── create-event.dto.ts
│   │       │   └── interfaces/
│   │       │       └── event.interface.ts
│   │       ├── rules/
│   │       │   ├── rules.module.ts
│   │       │   ├── rules.service.ts
│   │       │   ├── rules.registry.ts
│   │       │   └── rules/
│   │       │       ├── air-temperature.rule.ts
│   │       │       ├── air-humidity.rule.ts
│   │       │       ├── soil-moisture.rule.ts
│   │       │       ├── water-reservoir-level.rule.ts
│   │       │       ├── silo-level.rule.ts
│   │       │       └── equipment-status.rule.ts
│   │       ├── notifications/
│   │       │   ├── notifications.module.ts
│   │       │   ├── notifications.service.ts
│   │       │   ├── notifications.controller.ts
│   │       │   └── interfaces/
│   │       │       └── notification.interface.ts
│   │       ├── notification-providers/
│   │       │   ├── notification-providers.module.ts
│   │       │   ├── interfaces/
│   │       │   │   └── notification-provider.interface.ts
│   │       │   └── providers/
│   │       │       └── mock-whatsapp.provider.ts
│   │       ├── farm/
│   │       │   ├── farm.module.ts
│   │       │   ├── farm.controller.ts
│   │       │   └── farm.service.ts
│   │       ├── devices/
│   │       │   ├── devices.module.ts
│   │       │   ├── devices.controller.ts
│   │       │   └── devices.service.ts
│   │       └── prisma/
│   │           ├── prisma.module.ts
│   │           └── prisma.service.ts
│   │
│   └── frontend/                # Vite + React application
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── routes/
│           │   ├── Dashboard.tsx
│           │   ├── Simulator.tsx
│           │   └── History.tsx
│           ├── components/
│           │   ├── Layout.tsx
│           │   ├── EventCard.tsx
│           │   ├── NotificationCard.tsx
│           │   ├── DeviceList.tsx
│           │   └── FarmInfo.tsx
│           ├── services/
│           │   └── api.ts
│           ├── hooks/
│           │   ├── useEvents.ts
│           │   └── useNotifications.ts
│           ├── types/
│           │   └── index.ts
│           └── styles/
│               └── global.css
│
└── packages/
    └── shared-types/            # Tipos compartilhados
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts
            ├── event.ts
            ├── notification.ts
            ├── farm.ts
            ├── device.ts
            └── enums.ts
```

---

## 4. Modelagem de Dados

### Entidades (Prisma Schema)

```prisma
// Modelo conceitual — será refinado durante a implementação

model Farm {
  id        String   @id @default(uuid())
  name      String
  producer  String
  phone     String
  createdAt DateTime @default(now())
  devices   Device[]
  events    Event[]
}

model Device {
  id        String   @id
  farmId    String
  farm      Farm     @relation(fields: [farmId], references: [id])
  type      String   // AIR_TEMPERATURE, AIR_HUMIDITY, etc.
  label     String
  createdAt DateTime @default(now())
  events    Event[]
}

model Event {
  id        String   @id    // eventId (ex: "event-001")
  farmId    String
  farm      Farm     @relation(fields: [farmId], references: [id])
  deviceId  String
  device    Device   @relation(fields: [deviceId], references: [id])
  type      String
  value     Float?   // null para EQUIPMENT_STATUS (valor textual)
  textValue String?  // usado para EQUIPMENT_STATUS
  unit      String?
  timestamp DateTime
  receivedAt DateTime @default(now())
  notification Notification?

  @@index([farmId])
  @@index([deviceId])
  @@index([type])
}

model Notification {
  id              String   @id @default(uuid())
  eventId         String   @unique
  event           Event    @relation(fields: [eventId], references: [id])
  farmId          String
  deviceId        String
  eventType       String
  eventValue      Float?
  ruleTriggered   String   // Nome da regra que foi acionada
  severity        String   // CRITICAL, WARNING, INFO
  message         String   // Mensagem gerada para o produtor
  status          String   // PENDING, SENT, FAILED
  sentAt          DateTime?
  failureReason   String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([farmId])
  @@index([status])
  @@index([createdAt])
}
```

### Relacionamentos

```
Farm 1──N Device
Farm 1──N Event
Device 1──N Event
Event 1──1 Notification
```

---

## 5. Módulos do NestJS

### EventsModule
- **Controller:** `POST /api/events`, `GET /api/events`, `GET /api/events/:id`
- **Service:** `EventsService.processEvent()`, `EventsService.findAll()`
- **DTO:** `CreateEventDto` com validação via class-validator
- **Guard:** `IdempotencyGuard` — verifica duplicidade por `eventId`
- **Event Emit:** `this.eventEmitter.emit('event.received', event)`

### RulesModule
- **Service:** `RulesService` — escuta `event.received`, avalia todas as regras
- **Registry:** `RulesRegistry` — mantém lista de regras registradas
- **Regras individuais:** cada uma implementa `Rule` interface com `evaluate(event): RuleResult`
- **Event Emit:** `this.eventEmitter.emit('notification.generated', notification)` se alguma regra acionar

### NotificationsModule
- **Controller:** `GET /api/notifications`, `GET /api/notifications/:id`
- **Service:** `NotificationsService` — escuta `notification.generated`, persiste e envia
- **Integração com Provider:** chama `NotificationProvider.send()`

### NotificationProvidersModule
- **Interface:** `NotificationProvider` com método `send(notification): Promise<SendResult>`
- **Implementação MVP:** `MockWhatsAppProvider` — registra como SENT no banco
- **Futuro:** novos providers implementam a mesma interface

### FarmModule
- **Controller:** `GET /api/farm`
- **Service:** retorna dados da fazenda (fixos para MVP)

### DevicesModule
- **Controller:** `GET /api/devices`
- **Service:** retorna dispositivos cadastrados

---

## 6. Pipeline de Processamento

```
1. RECEBIMENTO
   POST /api/events
   ├── ValidationPipe valida campos, tipos, ranges
   ├── IdempotencyGuard verifica duplicidade
   └── EventService.processEvent()

2. PERSISTÊNCIA DO EVENTO
   ├── Salva Event no banco
   └── Emite 'event.received'

3. AVALIAÇÃO DE REGRAS
   ├── RulesService escuta 'event.received'
   ├── Itera sobre todas as regras registradas
   ├── Se regra acionada → gera Notification
   └── Emite 'notification.generated'

4. GERAÇÃO DA NOTIFICAÇÃO
   ├── NotificationsService escuta 'notification.generated'
   ├── Persiste Notification (status: PENDING)
   └── Chama NotificationProvider.send()

5. ENVIO (SIMULADO)
   ├── MockWhatsAppProvider.send()
   ├── Atualiza status para SENT (ou FAILED)
   └── Emite 'notification.sent'

6. CONSULTA
   ├── GET /api/events → lista eventos
   ├── GET /api/notifications → lista notificações
   └── Frontend consome e exibe em tempo real
```

### Tratamento de Eventos Duplicados

O `IdempotencyGuard` opera da seguinte forma:
1. Extrai o `eventId` do body da requisição.
2. Consulta o banco: `Event.findUnique({ where: { id: eventId } })`.
3. Se o evento já existe, retorna `200 OK` com o evento existente (sem gerar nova notificação).
4. Se não existe, permite o fluxo normal.

Isso garante que mesmo que o mesmo evento chegue múltiplas vezes, apenas uma notificação será gerada.

---

## 7. Interface Web (React + Vite)

### Páginas

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `Dashboard` | Visão geral: informações da fazenda, dispositivos, últimos eventos e notificações |
| `/simulator` | `Simulator` | Formulário para simular/envio de novas leituras de sensores |
| `/history` | `History` | Tabela com histórico completo de eventos e notificações |

### Componentes

| Componente | Descrição |
|---|---|
| `Layout` | Sidebar com navegação + header |
| `FarmInfo` | Card com dados da fazenda (nome, produtor, telefone) |
| `DeviceList` | Lista de dispositivos com tipo e status |
| `EventCard` | Card individual de evento recebido |
| `NotificationCard` | Card de notificação com mensagem, severidade e status de envio |
| `SimulatorForm` | Formulário para criar e enviar eventos manualmente |

### Consumo da API

O `vite.config.ts` configurará proxy para redirecionar chamadas `/api` para o NestJS em `localhost:3001`:

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 8. Estratégia de Testes

### Backend (NestJS — Jest)

| Nível | Ferramenta | O que testar |
|---|---|---|
| **Unitários** | Jest | Regras de notificação individualmente (pure functions), serviços com dependências mockadas |
| **Integração** | @nestjs/testing + supertest | Controladores com banco real (SQLite in-memory), pipeline completo |
| **E2E** | Jest + supertest | Fluxo completo: POST /api/events → verificar notificação gerada |

### Frontend (Vite — Vitest + Testing Library)

| Nível | Ferramenta | O que testar |
|---|---|---|
| **Unitários** | Vitest | Funções puras, formatação de dados |
| **Componentes** | Vitest + Testing Library | Renderização de cards, formulários, estados de loading/empty/error |
| **Integração** | Vitest + MSW | Componentes que consomem API, com mock de servidor |

### Cenários Obrigatórios (conforme Instructions.md)

- [x] Processamento de leitura normal (sem alerta)
- [x] Geração de cada tipo de alerta (6 regras)
- [x] Valores exatamente nos limites das regras (boundary testing)
- [x] Dados inválidos (campos ausentes, valores fora de range)
- [x] Eventos duplicados (idempotência)
- [x] Falha durante envio da notificação
- [x] Persistência correta do histórico

---

## 9. Plano de Implementação

### Fase 1 — Setup do Monorepo
- [ ] Inicializar pnpm workspace
- [ ] Configurar `tsconfig.base.json`
- [ ] Scaffold NestJS em `apps/backend`
- [ ] Scaffold Vite + React em `apps/frontend`
- [ ] Configurar `packages/shared-types`
- [ ] Verificar que ambos os servidores sobem

### Fase 2 — Modelagem e Banco
- [ ] Definir schema Prisma completo
- [ ] Criar migrations iniciais
- [ ] Implementar `PrismaModule` e `PrismaService`
- [ ] Seed de dados de demonstração (fazenda, dispositivos)

### Fase 3 — Core: EventsModule
- [ ] Implementar `CreateEventDto` com validação
- [ ] Implementar `EventsController` (POST + GET)
- [ ] Implementar `EventsService`
- [ ] Implementar `IdempotencyGuard`
- [ ] Testes do módulo

### Fase 4 — Core: RulesModule
- [ ] Implementar interface `Rule`
- [ ] Implementar `RulesRegistry`
- [ ] Implementar cada uma das 6 regras
- [ ] Implementar `RulesService` com event emitter listener
- [ ] Testes de cada regra (incluindo boundary)

### Fase 5 — Core: NotificationsModule
- [ ] Implementar interface `NotificationProvider`
- [ ] Implementar `MockWhatsAppProvider`
- [ ] Implementar `NotificationsService`
- [ ] Implementar `NotificationsController`
- [ ] Testes do pipeline completo

### Fase 6 — FarmModule + DevicesModule
- [ ] Implementar `FarmController` + `FarmService`
- [ ] Implementar `DevicesController` + `DevicesService`
- [ ] Seed de dados da fazenda e dispositivos

### Fase 7 — Frontend: Estrutura Base
- [ ] Configurar React Router
- [ ] Configurar proxy do Vite
- [ ] Implementar `Layout` com navegação
- [ ] Implementar serviço `api.ts` para chamadas HTTP
- [ ] Implementar hooks `useEvents`, `useNotifications`

### Fase 8 — Frontend: Páginas
- [ ] `Dashboard` — farm info, dispositivos, últimos eventos/notificações
- [ ] `Simulator` — formulário de envio de eventos
- [ ] `History` — tabela de histórico com filtros
- [ ] Estilização responsiva

### Fase 9 — Testes e Qualidade
- [ ] Testes unitários de todas as regras
- [ ] Testes de integração do pipeline
- [ ] Testes de componentes frontend
- [ ] Relatório de cobertura
- [ ] Revisão geral

### Fase 10 — Documentação
- [ ] `README.md` com instruções de execução
- [ ] `DEVELOPMENT_LOG.md` com registro do processo
- [ ] Instruções de teste e cobertura

---

## 10. API Endpoints (Resumo)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/events` | Receber um novo evento de sensor |
| `GET` | `/api/events` | Listar todos os eventos |
| `GET` | `/api/events/:id` | Obter evento específico |
| `GET` | `/api/notifications` | Listar todas as notificações |
| `GET` | `/api/notifications/:id` | Obter notificação específica |
| `GET` | `/api/farm` | Obter dados da fazenda |
| `GET` | `/api/devices` | Listar dispositivos |

---

## 11. Próximos Passos

Após aprovação deste planejamento, a implementação seguirá a ordem das fases acima, começando pela **Fase 1 — Setup do Monorepo**.

Cada fase será implementada de forma incremental, com validação e testes antes de prosseguir para a próxima.