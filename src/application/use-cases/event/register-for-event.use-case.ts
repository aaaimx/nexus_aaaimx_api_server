import { IEventRepository } from "@/domain/repositories/event.repository";
import { EventAttendee } from "@/domain/entities/event.entity";
import { EventBusinessService } from "@/application/services/event/event-business.service";
import { ATTENDEE_STATUS } from "@/shared/constants";
import AppException from "@/shared/utils/exception.util";

export interface RegisterForEventInput {
  eventId: string;
  userId: string;
}

export interface RegisterForEventOutput {
  attendance: EventAttendee;
  message: string;
}

export class RegisterForEventUseCase {
  private eventBusinessService: EventBusinessService;

  constructor(private readonly eventRepository: IEventRepository) {
    this.eventBusinessService = new EventBusinessService(eventRepository);
  }

  async execute(input: RegisterForEventInput): Promise<RegisterForEventOutput> {
    try {
      // Check if user can register
      const canRegister = await this.eventBusinessService.canUserRegister(
        input.userId,
        input.eventId
      );

      if (!canRegister.canRegister) {
        throw new AppException(
          canRegister.reason || "Cannot register for this event",
          400
        );
      }

      // Check if user is already registered but cancelled
      const existingAttendance =
        await this.eventRepository.findUserEventAttendance(
          input.userId,
          input.eventId
        );

      let attendance: EventAttendee;

      if (existingAttendance) {
        // Update existing attendance to registered
        attendance = await this.eventRepository.updateEventAttendee(
          existingAttendance.id,
          { status: ATTENDEE_STATUS.REGISTERED }
        );
      } else {
        // Create new attendance
        attendance = await this.eventRepository.createEventAttendee({
          userId: input.userId,
          eventId: input.eventId,
          status: ATTENDEE_STATUS.REGISTERED,
        });
      }

      return {
        attendance,
        message: "Successfully registered for event",
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(
        `Error registering for event: ${(error as Error).message}`,
        500
      );
    }
  }
}
