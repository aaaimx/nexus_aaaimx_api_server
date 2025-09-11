import { Request, Response } from "express";
import { ApiResponse } from "@/shared/utils/api-response.util";
import logger from "@/infrastructure/logger";
import { CreateEventUseCase } from "@/application/use-cases/event/create-event.use-case";
import { GetEventUseCase } from "@/application/use-cases/event/get-event.use-case";
import { ListEventsUseCase } from "@/application/use-cases/event/list-events.use-case";
import { UpdateEventUseCase } from "@/application/use-cases/event/update-event.use-case";
import { DeleteEventUseCase } from "@/application/use-cases/event/delete-event.use-case";
import { RegisterForEventUseCase } from "@/application/use-cases/event/register-for-event.use-case";
import { CancelEventRegistrationUseCase } from "@/application/use-cases/event/cancel-event-registration.use-case";
import { IEventRepository } from "@/domain/repositories/event.repository";
import { IUserRepository } from "@/domain/repositories/user.repository";
import { IRoleRepository } from "@/domain/repositories/role.repository";
import { CreateEventSchemaType } from "@/interfaces/validators/schemas/event/create-event.schema";
import { UpdateEventSchemaType } from "@/interfaces/validators/schemas/event/update-event.schema";
import { ListEventsSchemaType as _ListEventsSchemaType } from "@/interfaces/validators/schemas/event/list-events.schema";
import { EventParamsSchemaType } from "@/interfaces/validators/schemas/event/event-params.schema";
import AppException from "@/shared/utils/exception.util";

export class EventController {
  private createEventUseCase: CreateEventUseCase;
  private getEventUseCase: GetEventUseCase;
  private listEventsUseCase: ListEventsUseCase;
  private updateEventUseCase: UpdateEventUseCase;
  private deleteEventUseCase: DeleteEventUseCase;
  private registerForEventUseCase: RegisterForEventUseCase;
  private cancelEventRegistrationUseCase: CancelEventRegistrationUseCase;

  constructor(
    _eventRepository: IEventRepository,
    userRepository: IUserRepository,
    roleRepository: IRoleRepository
  ) {
    this.createEventUseCase = new CreateEventUseCase(
      _eventRepository,
      userRepository,
      roleRepository
    );
    this.getEventUseCase = new GetEventUseCase(_eventRepository);
    this.listEventsUseCase = new ListEventsUseCase(_eventRepository);
    this.updateEventUseCase = new UpdateEventUseCase(_eventRepository);
    this.deleteEventUseCase = new DeleteEventUseCase(_eventRepository);
    this.registerForEventUseCase = new RegisterForEventUseCase(
      _eventRepository
    );
    this.cancelEventRegistrationUseCase = new CancelEventRegistrationUseCase(
      _eventRepository
    );
  }

  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      const eventData: CreateEventSchemaType = req.body;
      const result = await this.createEventUseCase.execute({
        ...eventData,
        description: eventData.description || "",
        startDate: eventData.startDate || new Date(),
        endDate: eventData.endDate || new Date(),
        startTime: eventData.startTime || "",
        endTime: eventData.endTime || "",
        userId,
      } as any);

      const response = new ApiResponse(
        true,
        result.message,
        { event: result.event },
        201
      );

      res.status(201).json(response);
    } catch (error) {
      logger.error("Error creating event:", error);

      if (error instanceof AppException) {
        const response = new ApiResponse(
          false,
          error.message,
          null,
          error.status
        );
        res.status(error.status).json(response);
        return;
      }

      const response = new ApiResponse(
        false,
        "Internal server error",
        null,
        500
      );
      res.status(500).json(response);
    }
  }

  async getEvent(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params as EventParamsSchemaType;
      const { includeSessions, includeAttendees, includeStatistics } =
        req.query;

      const result = await this.getEventUseCase.execute({
        eventId,
        includeSessions: includeSessions === "true",
        includeAttendees: includeAttendees === "true",
        includeStatistics: includeStatistics === "true",
      });

      const response = new ApiResponse(
        true,
        "Event retrieved successfully",
        result,
        200
      );

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error getting event:", error);

      if (error instanceof AppException) {
        const response = new ApiResponse(
          false,
          error.message,
          null,
          error.status
        );
        res.status(error.status).json(response);
        return;
      }

      const response = new ApiResponse(
        false,
        "Internal server error",
        null,
        500
      );
      res.status(500).json(response);
    }
  }

  async listEvents(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = {
        ...req.query,
        page: req.query["page"] ? parseInt(req.query["page"] as string) : 1,
        limit: req.query["limit"] ? parseInt(req.query["limit"] as string) : 10,
        isPublic: req.query["isPublic"]
          ? req.query["isPublic"] === "true"
          : undefined,
        upcomingOnly: req.query["upcomingOnly"]
          ? req.query["upcomingOnly"] === "true"
          : undefined,
      };
      const result = await this.listEventsUseCase.execute(queryParams as any);

      const response = new ApiResponse(
        true,
        "Events retrieved successfully",
        result,
        200
      );

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error listing events:", error);

      if (error instanceof AppException) {
        const response = new ApiResponse(
          false,
          error.message,
          null,
          error.status
        );
        res.status(error.status).json(response);
        return;
      }

      const response = new ApiResponse(
        false,
        "Internal server error",
        null,
        500
      );
      res.status(500).json(response);
    }
  }

  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      const { eventId } = req.params as EventParamsSchemaType;
      const eventData: UpdateEventSchemaType = req.body;

      const result = await this.updateEventUseCase.execute({
        eventId,
        userId,
        ...eventData,
        name: eventData.name || "",
        description: eventData.description || "",
      } as any);

      const response = new ApiResponse(
        true,
        result.message,
        { event: result.event },
        200
      );

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error updating event:", error);

      if (error instanceof AppException) {
        const response = new ApiResponse(
          false,
          error.message,
          null,
          error.status
        );
        res.status(error.status).json(response);
        return;
      }

      const response = new ApiResponse(
        false,
        "Internal server error",
        null,
        500
      );
      res.status(500).json(response);
    }
  }

  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      const { eventId } = req.params as EventParamsSchemaType;

      const result = await this.deleteEventUseCase.execute({
        eventId,
        userId,
      });

      const response = new ApiResponse(true, result.message, null, 200);

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error deleting event:", error);

      if (error instanceof AppException) {
        const response = new ApiResponse(
          false,
          error.message,
          null,
          error.status
        );
        res.status(error.status).json(response);
        return;
      }

      const response = new ApiResponse(
        false,
        "Internal server error",
        null,
        500
      );
      res.status(500).json(response);
    }
  }

  async registerForEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      const { eventId } = req.params as EventParamsSchemaType;

      const result = await this.registerForEventUseCase.execute({
        eventId,
        userId,
      });

      const response = new ApiResponse(
        true,
        result.message,
        { attendance: result.attendance },
        200
      );

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error registering for event:", error);

      if (error instanceof AppException) {
        const response = new ApiResponse(
          false,
          error.message,
          null,
          error.status
        );
        res.status(error.status).json(response);
        return;
      }

      const response = new ApiResponse(
        false,
        "Internal server error",
        null,
        500
      );
      res.status(500).json(response);
    }
  }

  async cancelEventRegistration(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      const { eventId } = req.params as EventParamsSchemaType;

      const result = await this.cancelEventRegistrationUseCase.execute({
        eventId,
        userId,
      });

      const response = new ApiResponse(
        true,
        result.message,
        { attendance: result.attendance },
        200
      );

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error cancelling event registration:", error);

      if (error instanceof AppException) {
        const response = new ApiResponse(
          false,
          error.message,
          null,
          error.status
        );
        res.status(error.status).json(response);
        return;
      }

      const response = new ApiResponse(
        false,
        "Internal server error",
        null,
        500
      );
      res.status(500).json(response);
    }
  }

  async getUserEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppException("User not authenticated", 401);
      }

      const queryParams = {
        ...req.query,
        userId,
        page: req.query["page"] ? parseInt(req.query["page"] as string) : 1,
        limit: req.query["limit"] ? parseInt(req.query["limit"] as string) : 10,
        isPublic: req.query["isPublic"]
          ? req.query["isPublic"] === "true"
          : undefined,
        upcomingOnly: req.query["upcomingOnly"]
          ? req.query["upcomingOnly"] === "true"
          : undefined,
      };

      const result = await this.listEventsUseCase.execute(queryParams as any);

      const response = new ApiResponse(
        true,
        "User events retrieved successfully",
        result,
        200
      );

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error getting user events:", error);

      if (error instanceof AppException) {
        const response = new ApiResponse(
          false,
          error.message,
          null,
          error.status
        );
        res.status(error.status).json(response);
        return;
      }

      const response = new ApiResponse(
        false,
        "Internal server error",
        null,
        500
      );
      res.status(500).json(response);
    }
  }

  async getPublicEvents(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = {
        ...req.query,
        isPublic: true,
        page: req.query["page"] ? parseInt(req.query["page"] as string) : 1,
        limit: req.query["limit"] ? parseInt(req.query["limit"] as string) : 10,
        upcomingOnly: req.query["upcomingOnly"]
          ? req.query["upcomingOnly"] === "true"
          : undefined,
      };

      const result = await this.listEventsUseCase.execute(queryParams as any);

      const response = new ApiResponse(
        true,
        "Public events retrieved successfully",
        result,
        200
      );

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error getting public events:", error);

      if (error instanceof AppException) {
        const response = new ApiResponse(
          false,
          error.message,
          null,
          error.status
        );
        res.status(error.status).json(response);
        return;
      }

      const response = new ApiResponse(
        false,
        "Internal server error",
        null,
        500
      );
      res.status(500).json(response);
    }
  }

  async getUpcomingEvents(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = {
        ...req.query,
        upcomingOnly: true,
        page: req.query["page"] ? parseInt(req.query["page"] as string) : 1,
        limit: req.query["limit"] ? parseInt(req.query["limit"] as string) : 10,
        isPublic: req.query["isPublic"]
          ? req.query["isPublic"] === "true"
          : undefined,
      };

      const result = await this.listEventsUseCase.execute(queryParams as any);

      const response = new ApiResponse(
        true,
        "Upcoming events retrieved successfully",
        result,
        200
      );

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error getting upcoming events:", error);

      if (error instanceof AppException) {
        const response = new ApiResponse(
          false,
          error.message,
          null,
          error.status
        );
        res.status(error.status).json(response);
        return;
      }

      const response = new ApiResponse(
        false,
        "Internal server error",
        null,
        500
      );
      res.status(500).json(response);
    }
  }
}
