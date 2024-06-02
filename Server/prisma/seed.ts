import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

const prisma = new PrismaClient();

async function run() {
  // Deleta os dados existentes
  await prisma.dayHabit.deleteMany();
  await prisma.habitWeekDays.deleteMany();
  await prisma.day.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.singleTask.deleteMany();

  // Cria o dia atual
  const today = await prisma.day.create({
    data: {
      date: dayjs().startOf('day').toDate(),
    },
  });

  // Cria uma nova tarefa única e a associa ao dia atual
  await prisma.singleTask.create({
    data: {
      title: "Criar Software",
      date: dayjs().startOf('day').toDate(),
      day_id: today.id,
    },
  });
}

run()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
