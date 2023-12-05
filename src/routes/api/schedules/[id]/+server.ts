import { prisma } from '$lib';

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params }) {
  const schedule = await prisma.schedule.delete({
    where: { id: Number(params.id) }
  });
  return new Response(JSON.stringify(schedule), {
    headers: { 'content-type': 'application/json' }
  });
}

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request }) {
  const body = await request.json();
  const schedule = await prisma.schedule.update({
    where: { id: Number(params.id) },
    data: body
  });
  return new Response(JSON.stringify(schedule), {
    headers: { 'content-type': 'application/json' }
  });
}
