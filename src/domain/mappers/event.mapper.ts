import { Event } from "@/domain/entities/event.entity";

export class EventMapper {
  /**
   * Maps input data to Event entity, only including defined values
   */
  static mapToEventData<T extends Record<string, any>>(
    input: T,
    baseData: Partial<Event> = {}
  ): Partial<Event> {
    const fieldMappings = {
      description: input["description"],
      startDate: input["startDate"],
      endDate: input["endDate"],
      startTime: input["startTime"],
      endTime: input["endTime"],
      sessionDurationMinutes: input["sessionDurationMinutes"],
      coverUrl: input["coverUrl"],
      location: input["location"],
      isPublic: input["isPublic"],
      maxParticipants: input["maxParticipants"],
      organizerType: input["organizerType"],
      organizerUserId: input["organizerUserId"],
      organizerDivisionId: input["organizerDivisionId"],
      organizerClubId: input["organizerClubId"],
      externalOrganizerName: input["externalOrganizerName"],
      isRecurring: input["isRecurring"],
      recurrencePattern: input["recurrencePattern"],
      recurrenceInterval: input["recurrenceInterval"],
      recurrenceStartDate: input["recurrenceStartDate"],
      recurrenceEndDate: input["recurrenceEndDate"],
      recurrenceDays: input["recurrenceDays"],
    };

    const eventData = { ...baseData };

    // Only add defined values to eventData
    Object.entries(fieldMappings).forEach(([key, value]) => {
      if (value !== undefined) {
        (eventData as any)[key] = value;
      }
    });

    return eventData;
  }
}
