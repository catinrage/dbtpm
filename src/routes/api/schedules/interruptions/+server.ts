import { prisma } from '$lib';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const { scheduleId, interruptions } = await request.json();
  const schedule = await prisma.schedule.update({
    where: { id: scheduleId },
    data: { interruptions: interruptions }
  });
  return new Response(JSON.stringify(schedule), {
    headers: { 'content-type': 'application/json' }
  });
}
