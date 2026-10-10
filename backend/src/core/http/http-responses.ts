import type { FastifyReply } from "fastify";

import type {
  PublicApiErrorCode,
  PublicApiErrorResponseDTO
} from "@regexriddle/shared";

export function errorResponse(
  code: PublicApiErrorCode,
  error: string,
  message: string
): PublicApiErrorResponseDTO {
  return { code, error, message };
}

export function buildClientErrorResponse(
  statusCode: number
): PublicApiErrorResponseDTO {
  if (statusCode === 404) {
    return {
      code: "NOT_FOUND",
      error: "Not Found",
      message: "Resource not found."
    };
  }

  if (statusCode === 413) {
    return {
      code: "PAYLOAD_TOO_LARGE",
      error: "Payload Too Large",
      message: "Request body is too large."
    };
  }

  if (statusCode === 415) {
    return {
      code: "UNSUPPORTED_MEDIA_TYPE",
      error: "Unsupported Media Type",
      message: "Content-Type is not supported."
    };
  }

  return {
    code: "BAD_REQUEST",
    error: "Bad Request",
    message: "Invalid request."
  };
}

export function sendInternalServerError(reply: FastifyReply): FastifyReply {
  return reply
    .status(500)
    .send(
      errorResponse(
        "INTERNAL_SERVER_ERROR",
        "Internal Server Error",
        "An unexpected error occurred."
      )
    );
}

export function sendUnauthorized(reply: FastifyReply): FastifyReply {
  return reply
    .status(401)
    .send(
      errorResponse("UNAUTHORIZED", "Unauthorized", "Authentication required.")
    );
}

export function sendBadRequest(
  reply: FastifyReply,
  message: string,
  code: PublicApiErrorCode = "BAD_REQUEST"
): FastifyReply {
  return reply.status(400).send(errorResponse(code, "Bad Request", message));
}

export function sendNotFound(
  reply: FastifyReply,
  message: string
): FastifyReply {
  return reply
    .status(404)
    .send(errorResponse("NOT_FOUND", "Not Found", message));
}

export function sendForbidden(
  reply: FastifyReply,
  code: PublicApiErrorCode,
  message: string
): FastifyReply {
  return reply.status(403).send(errorResponse(code, "Forbidden", message));
}

export function sendConflict(
  reply: FastifyReply,
  code: PublicApiErrorCode,
  message: string
): FastifyReply {
  return reply.status(409).send(errorResponse(code, "Conflict", message));
}

export function sendUnprocessableEntity(
  reply: FastifyReply,
  code: PublicApiErrorCode,
  message: string
): FastifyReply {
  return reply
    .status(422)
    .send(errorResponse(code, "Unprocessable Entity", message));
}
