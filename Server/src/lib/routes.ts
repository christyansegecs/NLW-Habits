import { FastifyInstance } from 'fastify';
import { prisma } from './prisma';
import { z } from 'zod';
import dayjs from 'dayjs';

export async function appRoutes(app: FastifyInstance) {

    app.get('/', () => {
        return 'Hello NLW';
    });

    app.get('/hello', async () => {
        const habits = await prisma.habit.findMany({
            where: {
                title: {
                    startsWith: 'Beber',
                },
            },
        });
        return habits;
    });

    app.post('/habits', async (request) => {
        const createHabitBody = z.object({
            title: z.string(),
            weekDays: z.array(z.number().min(0).max(6)),
        });

        const { title, weekDays } = createHabitBody.parse(request.body);

        const today = dayjs().startOf('day').toDate();

        await prisma.habit.create({
            data: {
                title,
                created_at: today,
                weekDays: {
                    create: weekDays.map((weekDay) => ({
                        week_day: weekDay,
                    })),
                },
            },
        });
    });

    app.get('/day', async (request) => {
        const getDayParams = z.object({
            date: z.coerce.date(),
        });

        const { date } = getDayParams.parse(request.query);

        const parsedDate = dayjs(date).startOf('day');
        const weekDay = parsedDate.get('day');

        const possibleHabits = await prisma.habit.findMany({
            where: {
                created_at: {
                    lte: date,
                },
                weekDays: {
                    some: {
                        week_day: weekDay,
                    },
                },
            },
        });

        const day = await prisma.day.findUnique({
            where: {
                date: parsedDate.toDate(),
            },
            include: {
                dayHabits: true,
                singleTasks: true,
            },
        });

        const completedHabits = day?.dayHabits.map((dayHabit) => dayHabit.habit_id) ?? [];
        const completedTasks = day?.singleTasks.filter(task => task.completed).map(task => task.id) ?? [];
        const allCompletedItems = [...completedHabits, ...completedTasks];

        const totalPossibleItems = possibleHabits.length + (day?.singleTasks.length ?? 0);
        const totalCompletedItems = completedHabits.length + completedTasks.length;

        return {
            possibleHabits,
            completedHabits,
            tasks: day?.singleTasks ?? [],
            totalPossibleItems,
            totalCompletedItems,
        };
    });

    app.patch('/habits/:id/toggle', async (request) => {
        const toggleHabitParams = z.object({
            id: z.string().uuid(),
        });

        const { id } = toggleHabitParams.parse(request.params);

        const today = dayjs().startOf('day').toDate();

        let day = await prisma.day.findUnique({
            where: {
                date: today,
            },
        });

        if (!day) {
            day = await prisma.day.create({
                data: {
                    date: today,
                },
            });
        }

        const dayHabit = await prisma.dayHabit.findUnique({
            where: {
                day_id_habit_id: {
                    day_id: day.id,
                    habit_id: id,
                },
            },
        });

        if (dayHabit) {
            await prisma.dayHabit.delete({
                where: {
                    id: dayHabit.id,
                },
            });
        } else {
            await prisma.dayHabit.create({
                data: {
                    day_id: day.id,
                    habit_id: id,
                },
            });
        }
    });

    app.patch('/tasks/:id/toggle', async (request) => {
        const toggleTaskParams = z.object({
            id: z.string().uuid(),
        });

        const { id } = toggleTaskParams.parse(request.params);

        const task = await prisma.singleTask.findUnique({
            where: {
                id: id,
            },
        });

        if (!task) {
            return { message: "Task not found" };
        }

        await prisma.singleTask.update({
            where: {
                id: id,
            },
            data: {
                completed: !task.completed,
            },
        });
    });

    // Deletar hábito
    app.delete('/habits/:id', async (request, reply) => {
        const deleteHabitParams = z.object({
            id: z.string().uuid(),
        });

        const { id } = deleteHabitParams.parse(request.params);

        try {
            // Log para verificação
            console.log(`Deleting habit with ID: ${id}`);

            // Inicia uma transação
            await prisma.$transaction(async (prisma) => {
                // Deleta todas as referências ao hábito em dayHabits
                await prisma.dayHabit.deleteMany({
                    where: {
                        habit_id: id,
                    },
                });

                // Deleta todas as referências ao hábito em habitWeekDays
                await prisma.habitWeekDays.deleteMany({
                    where: {
                        habit_id: id,
                    },
                });

                // Deleta o hábito
                await prisma.habit.delete({
                    where: {
                        id: id,
                    },
                });
            });

            reply.send({ message: 'Habit deleted successfully' });
        } catch (error) {
            // Log do erro
            console.error('Error deleting habit:', error);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    app.delete('/tasks/:id', async (request, reply) => {
        const deleteTaskParams = z.object({
            id: z.string().uuid(),
        });

        const { id } = deleteTaskParams.parse(request.params);

        await prisma.singleTask.delete({
            where: {
                id: id,
            },
        });

        reply.send({ message: 'Task deleted successfully' });
    });

    app.get('/summary', async () => {
        const summary = await prisma.$queryRaw`
            SELECT 
                D.id, 
                D.date,
                (
                    SELECT 
                        cast(count(*) as float)
                    FROM day_habits DH
                    WHERE DH.day_id = D.id
                ) as completed,
                (
                    SELECT
                        cast(count(*) as float)
                    FROM habit_week_days HWD
                    JOIN habits H
                        ON H.id = HWD.habit_id
                    WHERE
                        HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
                        AND H.created_at <= D.date
                ) as amount
            FROM days D
        `;

        return summary;
    });

    app.post('/single-task', async (request) => {
        const createSingleTaskBody = z.object({
            title: z.string(),
            date: z.coerce.date(),
        });

        const { title, date } = createSingleTaskBody.parse(request.body);

        const taskDate = dayjs(date).startOf('day').toDate();

        const day = await prisma.day.findUnique({
            where: {
                date: taskDate,
            },
        }) ?? await prisma.day.create({
            data: {
                date: taskDate,
            },
        });

        await prisma.singleTask.create({
            data: {
                title,
                date: taskDate,
                day_id: day.id,
            },
        });

        return { message: 'Task created successfully' };
    });

    app.get('/single-task', async (request) => {
        const getSingleTaskParams = z.object({
            date: z.coerce.date(),
        });

        const { date } = getSingleTaskParams.parse(request.query);

        const taskDate = dayjs(date).startOf('day').toDate();

        const tasks = await prisma.singleTask.findMany({
            where: {
                date: taskDate,
            },
        });

        return tasks;
    });
}
