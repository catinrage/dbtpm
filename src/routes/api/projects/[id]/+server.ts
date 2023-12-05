import type { Project } from '@prisma/client';
import { prisma } from '$lib';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  const project = await prisma.project.findUnique({
    where: {
      id: Number(params.id)
    },
    include: {
      client: true,
      stages: true
    }
  });

  return new Response(JSON.stringify(project), {
    headers: { 'content-type': 'application/json' }
  });
}

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request }) {
  const body: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'clientId'> & { client: string } =
    await request.json();
  // if client already exists, connect to it, if not create it
  const client = await prisma.client.findUnique({ where: { name: body.client } });
  if (client) {
    try {
      const [project] = await prisma.$transaction(async (tx) => {
        const project = await tx.project.update({
          where: { id: Number(params.id) },
          data: {
            ...body,
            client: { connect: { name: body.client } }
          }
        });

        return [project];
      });
      return new Response(JSON.stringify({ project }), {
        headers: { 'content-type': 'application/json' }
      });
    } catch (e) {
      if (e && typeof e === 'object' && e instanceof PrismaClientKnownRequestError) {
        return new Response(e.message, { status: 500 });
      }
    }
  } else {
    const [client, project] = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({ data: { name: body.client } });

      const project = await tx.project.update({
        where: { id: Number(params.id) },
        data: {
          ...body,
          client: { connect: { name: client.name } }
        }
      });
      return [client, project];
    });
    return new Response(JSON.stringify({ client, project }), {
      headers: { 'content-type': 'application/json' }
    });
  }
}

// delete
/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params }) {
  const project = await prisma.project.delete({
    where: {
      id: Number(params.id)
    },
    include: {
      client: true
    }
  });

  // when deleting check if client has any other projects, if not delete client
  const client = await prisma.client.findUnique({
    where: {
      name: project.client.name
    },
    include: {
      projects: true
    }
  });

  if (client?.projects.length === 0) {
    await prisma.client.delete({
      where: {
        name: project.client.name
      }
    });
  }

  return new Response(JSON.stringify(project), {
    headers: { 'content-type': 'application/json' }
  });
}
