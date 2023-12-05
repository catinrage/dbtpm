import { prisma } from '$lib';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  const client = await prisma.client.findUnique({
    where: {
      name: params.name
    },
    include: {
      projects: true
    }
  });

  return new Response(JSON.stringify(client), {
    headers: { 'content-type': 'application/json' }
  });
}
