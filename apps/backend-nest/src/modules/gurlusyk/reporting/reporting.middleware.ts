import type { FastifyReply, FastifyRequest } from "fastify";
import { getTenantById } from "@fincore/tenant-core";

export async function tenantMiddleware(
  request: FastifyRequest<{ Params: { tenantId: string } }>,
  reply: FastifyReply
) {
  const { tenantId } = request.params;
  const tenant = getTenantById(tenantId);

  if (!tenant) {
    return reply.status(404).send({ message: `Tenant '${tenantId}' not found.` });
  }
}
