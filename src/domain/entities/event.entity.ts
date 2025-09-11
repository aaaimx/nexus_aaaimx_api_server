import {
  EventStatus,
  EventType,
  RecurrencePattern,
  OrganizerType,
  AttendeeStatus,
} from "@/shared/constants";

export interface Event {
  id: string;
  name: string;
  description?: string;
  status: EventStatus;
  eventType: EventType;

  // Campos para eventos únicos
  startDate?: Date;
  endDate?: Date;

  // Campos para eventos recurrentes
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceInterval?: number;
  recurrenceStartDate?: Date;
  recurrenceEndDate?: Date;
  recurrenceDays?: string; // "1,3,5" (lunes, miércoles, viernes)

  // Duración de cada sesión (en minutos)
  sessionDurationMinutes?: number;

  startTime?: string; // "09:00"
  endTime?: string; // "11:00"

  coverUrl?: string;
  location?: string;
  isPublic: boolean;
  maxParticipants?: number;
  createdAt: Date;
  updatedAt: Date;

  // Organizador polimórfico
  organizerType: OrganizerType;
  organizerUserId?: string | null;
  organizerDivisionId?: string | null;
  organizerClubId?: string | null;
  externalOrganizerName?: string | null;

  // Usuario que crea el evento (para auditoría)
  userId: string;
}

export interface EventSession {
  id: string;
  eventId: string;
  sessionDate: Date;
  startTime: string; // "09:00"
  endTime: string; // "11:00"
  isCancelled: boolean;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventAttendee {
  id: string;
  userId: string;
  eventId: string;
  status: AttendeeStatus;
  createdAt: Date;
  updatedAt: Date;
}
