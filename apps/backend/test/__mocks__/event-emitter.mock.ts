/**
 * CJS-compatible mock for @nestjs/event-emitter v12 (ESM-only in origin).
 * Provides a functional event-emitter that actually dispatches events
 * so the pipeline (event.received → notification.generated) works in e2e tests.
 *
 * Mapped via moduleNameMapper in jest-e2e.json.
 *
 * Strategy:
 *  - Each EventEmitterModule.forRoot() creates a fresh Node.js EventEmitter
 *  - @OnEvent decorator stores (event, target class, method) in a global registry
 *  - A bootstrapper resolves instances via ModuleRef on bootstrap
 */
import { EventEmitter } from 'events';
import { Module, DynamicModule, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

export const EVENT_LISTENER_METADATA = 'EVENT_LISTENER_METADATA';
export const EVENT_PAYLOAD = Symbol('REQUEST');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyConstructor = new (...args: any[]) => object;

// ── Global registry ──────────────────────────────────────────────────────────
interface ListenerEntry {
  event: string;
  target: AnyConstructor;
  methodName: string;
}

const listenerRegistry: ListenerEntry[] = [];

export function __registerListener(entry: ListenerEntry): void {
  listenerRegistry.push(entry);
}

export function __getListeners(): ListenerEntry[] {
  return listenerRegistry;
}

// ── OnEvent decorator ───────────────────────────────────────────────────────
export function OnEvent(event: string, _options?: Record<string, unknown>) {
  return (_target: object, _key: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const ctor = _target.constructor as AnyConstructor;
    __registerListener({ event, target: ctor, methodName: String(_key) });
    return descriptor;
  };
}

// ── Bootstrapper ─────────────────────────────────────────────────────────────
@Injectable()
class EventSubscribersBootstrapper implements OnApplicationBootstrap {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly emitter: EventEmitter,
  ) {}

  onApplicationBootstrap(): void {
    for (const entry of __getListeners()) {
      try {
        const instance = this.moduleRef.get(entry.target, { strict: false });
        if (instance && typeof (instance as Record<string, unknown>)[entry.methodName] === 'function') {
          this.emitter.on(entry.event, (...args: unknown[]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (instance as any)[entry.methodName](...args);
          });
        }
      } catch {
        // Instance not available yet — skip
      }
    }
  }
}

// ── EventEmitter2 wrapper (per-app emitter) ─────────────────────────────────
export class EventEmitter2 {
  private emitter: EventEmitter;

  constructor(emitter?: EventEmitter) {
    this.emitter = emitter || new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  emit(event: string | symbol, ...args: unknown[]): boolean {
    return this.emitter.emit(event, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string | symbol, listener: (...args: any[]) => void): EventEmitter2 {
    this.emitter.on(event, listener);
    return this;
  }
}

// ── EventEmitterModule.forRoot ──────────────────────────────────────────────
// Each call returns a DynamicModule with a unique module class so NestJS
// does not deduplicate emitters when multiple TestingModules are created.
let moduleCounter = 0;

@Module({})
export class EventEmitterModule {
  static forRoot(options?: Record<string, unknown>): DynamicModule {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(100);
    const emitter2 = new EventEmitter2(emitter);

    // Unique module identity per forRoot() call
    const idx = ++moduleCounter;
    @Module({})
    class UniqueEventEmitterModule {}
    Object.defineProperty(UniqueEventEmitterModule, 'name', {
      value: `EventEmitterModule_${idx}`,
    });

    return {
      global: options?.global !== false,
      module: UniqueEventEmitterModule,
      providers: [
        {
          provide: EventEmitter2,
          useValue: emitter2,
        },
        {
          provide: EventSubscribersBootstrapper,
          useFactory: (moduleRef: ModuleRef) =>
            new EventSubscribersBootstrapper(moduleRef, emitter),
          inject: [ModuleRef],
        },
      ],
      exports: [EventEmitter2],
    };
  }
}

// Re-export stub
export class EventEmitterReadinessWatcher {
  waitUntilReady(): Promise<void> {
    return Promise.resolve();
  }
}