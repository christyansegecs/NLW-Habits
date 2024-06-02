import * as Checkbox from '@radix-ui/react-checkbox';
import { Check, Trash } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import dayjs from 'dayjs';

interface HabitsListProps {
    date: Date;
    onCompletedChanged: (completed: number) => void;
}

interface HabitsInfo {
    possibleHabits: {
        id: string;
        title: string;
        created_at: string;
    }[];
    completedHabits: string[];
    tasks: {
        id: string;
        title: string;
        completed: boolean;
    }[];
}

export function HabitsList({ date, onCompletedChanged }: HabitsListProps) {
    const [habitsInfo, setHabitsInfo] = useState<HabitsInfo>();

    useEffect(() => {
        const isoDate = date.toISOString();
        console.log("Date sent in request:", isoDate);

        api.get('day', {
            params: {
                date: isoDate,
            },
        }).then((response) => {
            console.log(response.data);
            setHabitsInfo(response.data);
        });
    }, [date]);

    async function handleToggleHabit(habitId: string) {
        await api.patch(`/habits/${habitId}/toggle`);

        const isHabitAlreadyCompleted = habitsInfo!.completedHabits.includes(habitId);

        let completedHabits: string[] = [];

        if (isHabitAlreadyCompleted) {
            // Remover da lista
            completedHabits = habitsInfo!.completedHabits.filter((id) => id !== habitId);
        } else {
            // Adicionar na lista
            completedHabits = [...habitsInfo!.completedHabits, habitId];
        }

        setHabitsInfo({
            ...habitsInfo!,
            completedHabits,
        });

        onCompletedChanged(completedHabits.length + habitsInfo!.tasks.filter((task) => task.completed).length);
    }

    async function handleDeleteHabit(habitId: string) {
        try {
            console.log(`Deleting habit with ID: ${habitId}`); // Log do ID do hábito
            const response = await api.delete(`/habits/${habitId}`);
            console.log(response); // Log da resposta do servidor

            setHabitsInfo({
                ...habitsInfo!,
                possibleHabits: habitsInfo!.possibleHabits.filter((habit) => habit.id !== habitId),
                completedHabits: habitsInfo!.completedHabits.filter((id) => id !== habitId),
            });

            onCompletedChanged(habitsInfo!.completedHabits.length - 1 + habitsInfo!.tasks.filter((task) => task.completed).length);
        } catch (error) {
            console.error('Error deleting habit:', error); // Log do erro
        }
    }

    async function handleToggleTask(taskId: string) {
        await api.patch(`/tasks/${taskId}/toggle`);

        const updatedTasks = habitsInfo!.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );

        setHabitsInfo({
            ...habitsInfo!,
            tasks: updatedTasks,
        });

        onCompletedChanged(habitsInfo!.completedHabits.length + updatedTasks.filter((task) => task.completed).length);
    }

    async function handleDeleteTask(taskId: string) {
        await api.delete(`/tasks/${taskId}`);

        setHabitsInfo({
            ...habitsInfo!,
            tasks: habitsInfo!.tasks.filter((task) => task.id !== taskId),
        });

        onCompletedChanged(habitsInfo!.completedHabits.length + habitsInfo!.tasks.filter((task) => task.id !== taskId && task.completed).length - 1);
    }

    const isDateInPast = dayjs(date).endOf('day').isBefore(new Date());

    return (
        <div className='mt-6 flex flex-col gap-3'>
            <div>
                <h3 className='text-white font-bold text-lg'>Hábitos</h3>
                {habitsInfo?.possibleHabits.map((habit) => {
                    return (
                        <div key={habit.id} className='flex items-center gap-3'>
                            <Checkbox.Root
                                className='flex items-center gap-3 group focus:outline-none disabled:cursor-not-allowed'
                                checked={habitsInfo.completedHabits.includes(habit.id)}
                                disabled={isDateInPast}
                                onCheckedChange={() => handleToggleHabit(habit.id)}
                            >
                                <div className='h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 transition-colors group-focus:ring-2 group-focus:ring-violet-600 group-focus:ring-offset-2 group-focus:ring-offset-background'>
                                    <Checkbox.Indicator>
                                        <Check size={20} className='text-white' />
                                    </Checkbox.Indicator>
                                </div>

                                <span className='font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400'>
                                    {habit.title}
                                </span>
                            </Checkbox.Root>
                            {!isDateInPast && (
                                <button
                                    className='ml-2 p-1 rounded bg-red-500 hover:bg-red-400 text-white'
                                    onClick={() => handleDeleteHabit(habit.id)}
                                >
                                    <Trash size={20} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <div>
                <h3 className='text-white font-bold text-lg'>Tarefas</h3>
                {habitsInfo?.tasks.map((task) => {
                    return (
                        <div key={task.id} className='flex items-center gap-3'>
                            <Checkbox.Root
                                className='flex items-center gap-3 group focus:outline-none disabled:cursor-not-allowed'
                                checked={task.completed}
                                disabled={isDateInPast}
                                onCheckedChange={() => handleToggleTask(task.id)}
                            >
                                <div className='h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 transition-colors group-focus:ring-2 group-focus:ring-violet-600 group-focus:ring-offset-2 group-focus:ring-offset-background'>
                                    <Checkbox.Indicator>
                                        <Check size={20} className='text-white' />
                                    </Checkbox.Indicator>
                                </div>

                                <span className='font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400'>
                                    {task.title}
                                </span>
                            </Checkbox.Root>
                            {!isDateInPast && (
                                <button
                                    className='ml-2 p-1 rounded bg-red-500 hover:bg-red-400 text-white'
                                    onClick={() => handleDeleteTask(task.id)}
                                >
                                    <Trash size={20} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
