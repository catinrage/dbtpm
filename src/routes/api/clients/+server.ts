import { prisma } from '$lib';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: {
      name: 'asc'
    }
  });

  return new Response(JSON.stringify(clients), {
    headers: { 'content-type': 'application/json' }
  });
}
