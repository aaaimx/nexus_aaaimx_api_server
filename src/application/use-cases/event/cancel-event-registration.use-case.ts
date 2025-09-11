import { IEventRepository } from "@/domain/repositories/event.repository";
import { EventAttendee } from "@/domain/entities/event.entity";
import { ATTENDEE_STATUS } from "@/shared/constants";
import AppException from "@/shared/utils/exception.util";

export interface CancelEventRegistrationInput {
  eventId: string;
  userId: string;
}

export interface CancelEventRegistrationOutput {
  attendance: EventAttendee;
  message: string;
}

export class CancelEventRegistrationUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(
    input: CancelEventRegistrationInput
  ): Promise<CancelEventRegistrationOutput> {
    try {
      // Check if event exists
      const event = await this.eventRepository.findById(input.eventId);
      if (!event) {
        throw new AppException("Event not found", 404);
      }

      // Check if user is registered
      const existingAttendance =
        await this.eventRepository.findUserEventAttendance(
          input.userId,
          input.eventId
        );

      if (!existingAttendance) {
        throw new AppException("User is not registered for this event", 400);
      }

      if (existingAttendance.status === ATTENDEE_STATUS.CANCELLED) {
        throw new AppException(
          "User has already cancelled their registration",
          400
        );
      }

      // Update attendance status to cancelled
      const attendance = await this.eventRepository.updateEventAttendee(
        existingAttendance.id,
        { status: ATTENDEE_STATUS.CANCELLED }
      );

      return {
        attendance,
        message: "Successfully cancelled event registration",
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error cancelling event registration: ${(error as Error).message}`,
        500
      );
    }
  }
}
