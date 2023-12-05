import { prisma } from '$lib';
import type { Stage } from '@prisma/client';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  const stage = await prisma.stage.findUnique({
    where: {
      id: Number(params.id)
    },
    include: {
      project: {
        include: {
          client: true,
          stages: {
            orderBy: {
              id: 'asc'
            }
          }
        }
      }
    }
  });

  return new Response(JSON.stringify(stage), {
    headers: { 'content-type': 'application/json' }
  });
}

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request }) {
  const { id } = params;
  const body: Omit<Stage, 'id' | 'createdAt' | 'updatedAt'> = await request.json();

  const stage = await prisma.stage.update({
    where: { id: Number(id) },
    data: body
  });

  return new Response(JSON.stringify(stage), {
    headers: { 'content-type': 'application/json' }
  });
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params }) {
  const { id } = params;

  const stage = await prisma.stage.delete({
    where: { id: Number(id) }
  });

  return new Response(JSON.stringify(stage), {
    headers: { 'content-type': 'application/json' }
  });
}
