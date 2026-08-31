import { useState, useCallback, useEffect, type FormEvent, type ReactNode } from 'react';
import { useDevices } from '../hooks/useDevices';
import { useCreateEvent } from '../hooks/useCreateEvent';
import {
  listNotifications,
  ApiError,
} from '../services/api';
import type {
  DeviceResponse,
  CreateEventDto,
} from 'shared-types';
import { EventType } from 'shared-types';

// ---------------------------------------------------------------------------
// Local types
// ---------------------------------------------------------------------------

type FeedbackKind = 'alert' | 'no_alert' | 'duplicate' | 'invalid' | null;

interface FormData {
  deviceId: string;
  eventId: string;
  value: string;
  timestamp: string;
}

interface ValidationErrors {
  deviceId?: string;
  eventId?: string;
  value?: string;
  timestamp?: string;
}

interface Feedback {
  kind: FeedbackKind;
  message: string;
  fieldErrors?: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FARM_ID = 'farm-001';

const VALID_RANGES: Record<string, [number, number]> = {
  AIR_TEMPERATURE: [-20, 60],
  AIR_HUMIDITY: [0, 100],
  SOIL_MOISTURE: [0, 100],
  WATER_RESERVOIR_LEVEL: [0, 100],
  SILO_LEVEL: [0, 100],
};

const PRESETS: Array<{
  label: string;
  deviceId: string;
  eventId?: string;
  value: string;
  timestamp?: string;
}> = [
  { label: 'Temperature 38.5°C (alert)', deviceId: 'sensor-temp-01', value: '38.5' },
  { label: 'Humidity 24% (alert)', deviceId: 'sensor-humidity-01', value: '24' },
  { label: 'Soil Moisture 17% (alert)', deviceId: 'sensor-soil-01', value: '17' },
  { label: 'Reservoir 12% (alert)', deviceId: 'reservoir-sensor-01', value: '12' },
  { label: 'Silo 10% (alert)', deviceId: 'silo-sensor-01', value: '10' },
  { label: 'Equipment FAILURE (alert)', deviceId: 'irrigation-pump-01', value: 'FAILURE' },
  { label: 'Temperature 27°C (normal)', deviceId: 'sensor-temp-01', value: '27' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getUnitForType(type: string): string | null {
  if (type === EventType.AIR_TEMPERATURE) return 'C';
  if (type === EventType.EQUIPMENT_STATUS) return null;
  return '%';
}

function getUnitDisplay(type: string): string | null {
  if (type === EventType.EQUIPMENT_STATUS) return 'none';
  return getUnitForType(type);
}

function generateEventId(): string {
  return `event-${crypto.randomUUID()}`;
}

function getNowForDateTimeLocal(): string {
  return new Date().toISOString().slice(0, 16);
}

function toIsoTimestamp(dtLocal: string): string {
  return `${dtLocal}:00Z`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SimulatorForm() {
  // --- Queries & mutations ---
  const { data: devicesData, isLoading: devicesLoading } = useDevices();
  const { mutateAsync, isPending } = useCreateEvent();

  const devices = devicesData?.data ?? [];

  // --- State ---
  const [selectedDevice, setSelectedDevice] = useState<DeviceResponse | null>(null);
  const [formData, setFormData] = useState<FormData>({
    deviceId: '',
    eventId: generateEventId(),
    value: '',
    timestamp: getNowForDateTimeLocal(),
  });
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // --- Derived ---
  const isEquipment = selectedDevice?.type === EventType.EQUIPMENT_STATUS;

  // --- Handlers ---

  const handleDeviceChange = useCallback(
    (deviceId: string) => {
      const device = devices.find((d) => d.id === deviceId) ?? null;
      setSelectedDevice(device);
      setFormData((prev) => ({
        ...prev,
        deviceId,
        eventId: generateEventId(),
        value: device?.type === EventType.EQUIPMENT_STATUS ? 'OK' : '',
      }));
      setFeedback(null);
      setValidationErrors({});
    },
    [devices],
  );

  const applyPreset = useCallback(
    (preset: (typeof PRESETS)[number]) => {
      const device = devices.find((d) => d.id === preset.deviceId) ?? null;
      setSelectedDevice(device);
      setFormData({
        deviceId: preset.deviceId,
        eventId: preset.eventId ?? generateEventId(),
        value: preset.value,
        timestamp: getNowForDateTimeLocal(),
      });
      setFeedback(null);
      setValidationErrors({});
    },
    [devices],
  );

  const validateForm = useCallback((): ValidationErrors | null => {
    const errors: ValidationErrors = {};

    if (!formData.eventId.trim()) {
      errors.eventId = 'Event ID is required.';
    }
    if (!formData.deviceId) {
      errors.deviceId = 'Please select a device.';
    }
    if (!formData.timestamp.trim()) {
      errors.timestamp = 'Timestamp is required.';
    }

    // Value validation
    if (selectedDevice) {
      if (isEquipment) {
        if (
          !formData.value ||
          !['OK', 'FAILURE', 'MAINTENANCE'].includes(formData.value)
        ) {
          errors.value = 'Value must be OK, FAILURE, or MAINTENANCE.';
        }
      } else {
        const num = Number(formData.value);
        if (formData.value.trim() === '' || Number.isNaN(num)) {
          errors.value = 'A numeric value is required.';
        } else {
          const range = VALID_RANGES[selectedDevice.type];
          if (range && (num < range[0] || num > range[1])) {
            errors.value = `Value must be between ${range[0]} and ${range[1]}.`;
          }
        }
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }, [formData, selectedDevice, isEquipment]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const errors = validateForm();
      if (errors) {
        setValidationErrors(errors);
        setFeedback(null);
        return;
      }

      setValidationErrors({});
      setFeedback(null);

      if (!selectedDevice) return;

      const dto: CreateEventDto = {
        eventId: formData.eventId,
        farmId: FARM_ID,
        deviceId: selectedDevice.id,
        type: selectedDevice.type as EventType,
        value: isEquipment ? formData.value : Number(formData.value),
        unit: getUnitForType(selectedDevice.type),
        timestamp: toIsoTimestamp(formData.timestamp),
      };

      try {
        const result = await mutateAsync(dto);

        // Check for duplicate flag
        const resultAny = result as unknown as Record<string, unknown>;
        const hasDuplicate =
          result !== null &&
          typeof result === 'object' &&
          'duplicate' in resultAny &&
          resultAny.duplicate === true;

        if (hasDuplicate) {
          setFeedback({
            kind: 'duplicate',
            message: 'Duplicate event — already processed.',
          });
        } else {
          // Wait 500ms then poll notifications
          await new Promise((r) => setTimeout(r, 500));
          const notifs = await listNotifications({ limit: 50 });
          const match = notifs.data.find(
            (n) => n.eventId === formData.eventId,
          );

          if (match) {
            setFeedback({
              kind: 'alert',
              message: match.message,
            });
          } else {
            setFeedback({
              kind: 'no_alert',
              message: 'Event recorded — no alert generated.',
            });
          }
        }

        // After success: refresh eventId + timestamp, keep device + value
        setFormData((prev) => ({
          ...prev,
          eventId: generateEventId(),
          timestamp: getNowForDateTimeLocal(),
        }));
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          if (error.status === 400 && error.fieldMessages) {
            setFeedback({
              kind: 'invalid',
              message: 'Validation error',
              fieldErrors: error.fieldMessages,
            });
          } else if (error.status === 409) {
            setFeedback({
              kind: 'duplicate',
              message: 'Duplicate event — already processed.',
            });
          } else {
            setFeedback({
              kind: 'invalid',
              message: error.message || 'Unknown error',
            });
          }
        } else {
          setFeedback({
            kind: 'invalid',
            message:
              error instanceof Error ? error.message : 'Unexpected error',
          });
        }
      }
    },
    [validateForm, selectedDevice, formData, isEquipment, mutateAsync],
  );

  // --- Initial timestamp on mount ---
  useEffect(() => {
    setFormData((prev) => ({ ...prev, timestamp: getNowForDateTimeLocal() }));
  }, []);

  // --- Feedback panel styles ---
  const feedbackBg = {
    alert: 'bg-green-50 border border-green-200',
    no_alert: 'bg-blue-50 border border-blue-200',
    duplicate: 'bg-yellow-50 border border-yellow-200',
    invalid: 'bg-red-50 border border-red-200',
  };

  const feedbackText = {
    alert: 'text-green-800',
    no_alert: 'text-blue-800',
    duplicate: 'text-yellow-800',
    invalid: 'text-red-800',
  };

  // Compute feedback panel outside JSX so TS narrows kind
  let feedbackPanel: ReactNode = null;
  if (feedback) {
    const kind = feedback.kind as NonNullable<FeedbackKind>;
    feedbackPanel = (
      <div
        className={`${feedbackBg[kind]} ${feedbackText[kind]} p-4 rounded-card shadow-sm self-start`}
      >
        <p className="font-semibold text-sm mb-1">
          {kind === 'alert' && 'Alert generated'}
          {kind === 'no_alert' && 'No alert'}
          {kind === 'duplicate' && 'Duplicate'}
          {kind === 'invalid' && 'Error'}
        </p>
        <p className="text-sm whitespace-pre-wrap">{feedback.message}</p>
        {feedback.fieldErrors && feedback.fieldErrors.length > 0 && (
          <ul className="list-disc list-inside mt-2 text-sm">
            {feedback.fieldErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Form column */}
      <div className="bg-card rounded-card border border-border shadow-sm">
        <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>
          {/* Device selector */}
          <div>
            <label
              htmlFor="device-select"
              className="block text-sm font-medium text-card-foreground mb-1"
            >
              Device
            </label>
            <select
              id="device-select"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-card-foreground"
              value={formData.deviceId}
              onChange={(e) => handleDeviceChange(e.target.value)}
              disabled={devicesLoading}
            >
              <option value="">{devicesLoading ? 'Loading…' : 'Select a device'}</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label} ({d.id})
                </option>
              ))}
            </select>
            {validationErrors.deviceId && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.deviceId}</p>
            )}
          </div>

          {/* Derived type/unit */}
          {selectedDevice && (
            <p className="text-sm text-muted-foreground -mt-2">
              Type: {selectedDevice.type} | Unit: {getUnitDisplay(selectedDevice.type)}
            </p>
          )}

          {/* eventId */}
          <div>
            <label
              htmlFor="event-id"
              className="block text-sm font-medium text-card-foreground mb-1"
            >
              Event ID
            </label>
            <input
              id="event-id"
              type="text"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-card-foreground"
              value={formData.eventId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, eventId: e.target.value }))
              }
            />
            {validationErrors.eventId && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.eventId}</p>
            )}
          </div>

          {/* Value input: select for equipment, number for sensors */}
          <div>
            <label
              htmlFor="value-input"
              className="block text-sm font-medium text-card-foreground mb-1"
            >
              Value
            </label>
            {isEquipment ? (
              <select
                id="value-input"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-card-foreground"
                value={formData.value}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, value: e.target.value }))
                }
              >
                <option value="OK">OK</option>
                <option value="FAILURE">FAILURE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            ) : (
              <input
                id="value-input"
                type="number"
                step="0.1"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-card-foreground"
                value={formData.value}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, value: e.target.value }))
                }
                placeholder="0.0"
              />
            )}
            {validationErrors.value && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.value}</p>
            )}
          </div>

          {/* Timestamp */}
          <div>
            <label
              htmlFor="timestamp"
              className="block text-sm font-medium text-card-foreground mb-1"
            >
              Timestamp
            </label>
            <input
              id="timestamp"
              type="datetime-local"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-card-foreground"
              value={formData.timestamp}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, timestamp: e.target.value }))
              }
            />
            {validationErrors.timestamp && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.timestamp}</p>
            )}
          </div>

          {/* Presets */}
          <div>
            <p className="text-sm font-medium text-card-foreground mb-2">
              Quick Presets
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="border border-border px-3 py-1.5 rounded text-xs text-card-foreground hover:bg-muted transition-colors text-left"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isPending || devicesLoading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Submitting…' : 'Submit Event'}
          </button>
        </form>
      </div>

      {/* Feedback column */}
      {feedbackPanel}
    </div>
  );
}