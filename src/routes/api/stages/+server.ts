import { prisma } from '$lib';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  const stage = await prisma.stage.findMany({
    include: {
      project: {
        include: {
          client: true,
          stages: true
        }
      }
    }
  });

  return new Response(JSON.stringify(stage), {
    headers: { 'content-type': 'application/json' }
  });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const body = await request.json();
  const stage = await prisma.stage.create({
    data: {
      project: { connect: { id: body.projectId } }
    }
  });

  return new Response(JSON.stringify(stage), {
    headers: { 'content-type': 'application/json' }
  });
}
