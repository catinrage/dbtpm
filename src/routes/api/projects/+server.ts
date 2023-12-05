import type { Project } from '@prisma/client';
import { prisma } from '$lib';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const body: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'clientId'> & { client: string } =
    await request.json();
  const client = await prisma.client.findUnique({ where: { name: body.client } });
  if (client) {
    try {
      const [project, stage] = await prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
          data: {
            ...body,
            client: { connect: { name: body.client } }
          }
        });

        const stage = await tx.stage.create({
          data: {
            project: { connect: { id: project.id } }
          }
        });
        return [project, stage];
      });
      return new Response(JSON.stringify({ project, stage }), {
        headers: { 'content-type': 'application/json' }
      });
    } catch (e) {
      if (e && typeof e === 'object' && e instanceof PrismaClientKnownRequestError) {
        return new Response(e.message, { status: 500 });
      }
    }
  } else {
    const [client, project, stage] = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({ data: { name: body.client } });

      const project = await tx.project.create({
        data: {
          ...body,
          client: { connect: { name: client.name } }
        }
      });

      const stage = await tx.stage.create({
        data: {
          project: { connect: { id: project.id } }
        }
      });
      return [client, project, stage];
    });
    return new Response(JSON.stringify({ client, project, stage }), {
      headers: { 'content-type': 'application/json' }
    });
  }
}

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  const projects = await prisma.project.findMany({
    include: {
      client: true,
      stages: {
        orderBy: {
          id: 'asc'
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return new Response(JSON.stringify(projects), {
    headers: { 'content-type': 'application/json' }
  });
}
