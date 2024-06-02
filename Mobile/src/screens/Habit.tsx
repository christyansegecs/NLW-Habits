import { ScrollView, View, Text, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { BackButton } from '../components/BackButton';
import { ProgressBar } from '../components/ProgressBar';
import { Checkbox } from '../components/Checkbox';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Loading } from '../components/Loading';
import { api } from '../lib/axios';
import { generateProgressPercentage } from '../utils/generate-progress-percentage';
import { HabitsEmpty } from '../components/HabitsEmpty';
import clsx from 'clsx';

interface Params {
    date: string;
}

interface DayInfoProps {
    completedHabits: string[];
    possibleHabits: {
        id: string;
        title: string;
    }[];
    tasks: {
        id: string;
        title: string;
        completed: boolean;
    }[];
    totalPossibleItems: number;
    totalCompletedItems: number;
}

export function Habit() {
    const [loading, setLoading] = useState(true);
    const [dayInfo, setDayInfo] = useState<DayInfoProps | null>(null);

    const route = useRoute();
    const { date } = route.params as Params;

    console.log("Date received from route params:", date);

    const parsedDate = dayjs(date).startOf('day').add(3, 'hour');  // Ajuste para o fuso horário pt-br
    const isDateInPast = parsedDate.endOf('day').isBefore(new Date());
    const dayOfWeek = parsedDate.format('dddd');
    const dayAndMonth = parsedDate.format('DD/MM');

    const habitsProgress = dayInfo
        ? generateProgressPercentage(dayInfo.totalPossibleItems, dayInfo.totalCompletedItems)
        : 0;

    async function fetchHabitsAndTasks() {
        try {
            setLoading(true);
            const isoDate = parsedDate.toISOString();
            console.log("Fetching habits and tasks for date:", isoDate);
            const response = await api.get('/day', { params: { date: isoDate } });
            console.log("Data fetched from /day endpoint:", response.data);
            setDayInfo(response.data);
        } catch (error) {
            console.log(error);
            Alert.alert('Ops', 'Não foi possível carregar as informações dos hábitos e tarefas');
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleHabit(habitId: string) {
        try {
            await api.patch(`/habits/${habitId}/toggle`);
            if (dayInfo) {
                const isHabitAlreadyCompleted = dayInfo.completedHabits.includes(habitId);
                const updatedCompletedHabits = isHabitAlreadyCompleted
                    ? dayInfo.completedHabits.filter(id => id !== habitId)
                    : [...dayInfo.completedHabits, habitId];

                setDayInfo({
                    ...dayInfo,
                    completedHabits: updatedCompletedHabits,
                    totalCompletedItems: isHabitAlreadyCompleted
                        ? dayInfo.totalCompletedItems - 1
                        : dayInfo.totalCompletedItems + 1
                });
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Ops', 'Não foi possível atualizar o estado do hábito');
        }
    }

    async function handleToggleTask(taskId: string) {
        try {
            await api.patch(`/tasks/${taskId}/toggle`);
            if (dayInfo) {
                const updatedTasks = dayInfo.tasks.map(task =>
                    task.id === taskId ? { ...task, completed: !task.completed } : task
                );

                const updatedTotalCompletedItems = updatedTasks.filter(task => task.completed).length
                    + dayInfo.completedHabits.length;

                setDayInfo({
                    ...dayInfo,
                    tasks: updatedTasks,
                    totalCompletedItems: updatedTotalCompletedItems
                });
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Ops', 'Não foi possível atualizar o estado da tarefa');
        }
    }

    useEffect(() => {
        if (date) {
            fetchHabitsAndTasks();
        }
    }, [date]);

    if (loading) {
        return <Loading />;
    }

    return (
        <View className='flex-1 bg-background px-8 pt-16'>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <BackButton />

                <Text className='mt-6 text-zinc-400 font-semibold text-base lowercase'>
                    {dayOfWeek}
                </Text>

                <Text className='text-white font-extrabold text-3xl'>
                    {dayAndMonth}
                </Text>

                <ProgressBar progress={habitsProgress} />

                <Text className='text-white font-bold text-xl mt-6'>
                    Hábitos
                </Text>

                <View className={clsx('mt-2', {
                    ['opacity-50']: isDateInPast
                })}>
                    {dayInfo?.possibleHabits && dayInfo.possibleHabits.length > 0 ? (
                        dayInfo.possibleHabits.map(habit => (
                            <Checkbox
                                key={habit.id}
                                title={habit.title}
                                checked={dayInfo.completedHabits.includes(habit.id)}
                                disabled={isDateInPast}
                                onPress={() => handleToggleHabit(habit.id)}
                            />
                        ))
                    ) : (
                        <HabitsEmpty />
                    )}

                    <Text className='text-white font-bold text-xl mt-6 mb-2'>
                        Tarefas
                    </Text>

                    {dayInfo?.tasks && dayInfo.tasks.length > 0 ? (
                        dayInfo.tasks.map(task => (
                            <Checkbox
                                key={task.id}
                                title={task.title}
                                checked={task.completed}
                                disabled={isDateInPast}
                                onPress={() => handleToggleTask(task.id)}
                            />
                        ))
                    ) : (
                        <Text className='text-zinc-400 text-lg mt-2'>
                            Nenhuma tarefa para este dia.
                        </Text>
                    )}
                </View>

                {isDateInPast && (
                    <Text className='text-white mt-10 text-center'>
                        Você não pode editar hábitos de uma data passada.
                    </Text>
                )}
            </ScrollView>
        </View>
    );
}
