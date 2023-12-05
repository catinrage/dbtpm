import type { Prisma, Schedule } from '@prisma/client';
import { prisma } from '$lib';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  const schedules = await prisma.schedule.findMany({
    include: {
      stage: {
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
      }
    },
    orderBy: {
      order: 'asc'
    }
  });
  for (const i in schedules) {
    const schedule = schedules[i] as Prisma.ScheduleGetPayload<{
      include: {
        stage: true;
      };
    }> & { endDate: Date };
    const startDate = Number(i) === 0 ? schedule.startDate : schedules[Number(i) - 1].endDate;
    const stage = schedule.stage;

    const interruptions = schedule.interruptions as {
      title: string;
      duration: string;
    }[];
    const interruptionsTime = interruptions
      .filter((i) => {
        return i.title && i.duration;
      })
      .reduce((acc, interruption) => {
        return acc + Number(interruption.duration);
      }, 0);

    const timePerPart = stage.cycleDuration + stage.preparationDuration;
    const totalTime = timePerPart * (schedule.processQuantity / stage.numberOfOutputParts);
    const totalTimeWithEfficiency = totalTime / stage.efficiency + interruptionsTime;
    const totalTimeWithEfficiencyInMilliseconds = totalTimeWithEfficiency * 60 * 1000;

    schedule.endDate = new Date(
      new Date(startDate).getTime() + totalTimeWithEfficiencyInMilliseconds
    );
  }
  return new Response(JSON.stringify(schedules), {
    headers: { 'content-type': 'application/json' }
  });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const body: Omit<Schedule, 'id' | 'state' | 'interruptions'> = await request.json();
  const schedule = await prisma.schedule.create({
    data: { ...body, startDate: new Date(body.startDate) }
  });
  return new Response(JSON.stringify(schedule), {
    headers: { 'content-type': 'application/json' }
  });
}
