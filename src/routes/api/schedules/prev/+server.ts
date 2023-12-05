import { prisma } from '$lib';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const body: { id: number } = await request.json();
  const current = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: body.id
    }
  });
  const prev = await prisma.schedule.findFirst({
    where: {
      order: {
        lt: current.order
      }
    },
    orderBy: {
      order: 'desc'
    }
  });
  return new Response(JSON.stringify(prev), {
    headers: { 'content-type': 'application/json' }
  });
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request }) {
  const body: { id: number; direction: 'UP' | 'DOWN' } = await request.json();
  const current = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: body.id
    }
  });
  const prev = await prisma.schedule.findFirst({
    where: {
      order: {
        lt: current.order
      }
    },
    orderBy: {
      order: 'desc'
    }
  });
  const next = await prisma.schedule.findFirst({
    where: {
      order: {
        gt: current.order
      }
    },
    orderBy: {
      order: 'asc'
    }
  });
  const prevO = prev?.order;
  const nextO = next?.order;

  if (body.direction === 'UP') {
    if (prev) {
      await prisma.schedule.update({
        where: {
          id: prev.id
        },
        data: {
          order: current.order
        }
      });
      await prisma.schedule.update({
        where: {
          id: current.id
        },
        data: {
          order: prevO
        }
      });
    }
  } else if (body.direction === 'DOWN') {
    if (next) {
      await prisma.schedule.update({
        where: {
          id: next.id
        },
        data: {
          order: current.order
        }
      });
      await prisma.schedule.update({
        where: {
          id: current.id
        },
        data: {
          order: nextO
        }
      });
    }
  }
  return new Response(JSON.stringify({ prev, next }), {
    headers: { 'content-type': 'application/json' }
  });
}
