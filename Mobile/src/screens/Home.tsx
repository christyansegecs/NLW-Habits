
import { View, Text, ScrollView, Alert } from 'react-native'
import { Header } from '../components/Header'
import { HabitDay, DAY_SIZE } from '../components/HabitDay'
import { api } from '../lib/axios'
import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { Loading } from '../components/Loading'
import dayjs from 'dayjs'

type SummaryProps = Array<{
    id: string
    date: string
    amount: number
    completed: number
}>

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const datesFromYearStart = generateDatesFromYearBeginning()
const minimumSummaryDatesSize = 18 * 5
const amountOfDaysToFill = minimumSummaryDatesSize - datesFromYearStart.length

// Function to reorder weekDays based on the first day of the month
function reorderWeekDays(firstDayOfMonth: number) {
    const orderedWeekDays = [...weekDays.slice(firstDayOfMonth), ...weekDays.slice(0, firstDayOfMonth)]
    return orderedWeekDays
}

export function Home() {

    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState<SummaryProps | null>(null)
    const { navigate } = useNavigation()

    async function fetchData() {
        try {
            setLoading(true)
            const response = await api.get('/summary')
            console.log(response.data)
            setSummary(response.data)
        } catch (error) {
            Alert.alert('Ops', 'Não foi possível carregar o sumário de hábitos.')
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(useCallback(() => {
        fetchData()
    },[]))

    if (loading) {
        return(
            <Loading />
        )
    }

    // Determine the first day of the year
    const firstDayOfMonth = dayjs(datesFromYearStart[0]).day()
    const orderedWeekDays = reorderWeekDays(firstDayOfMonth)

    return(
        <View className='flex-1 bg-background px-8 pt-16'>
            <Header />

            <View className='flex-row mt-6 mb-2'>
                {
                    orderedWeekDays.map((weekDay, i) => (
                        <Text 
                            key={`${weekDay}-${i}`}
                            className='text-zinc-400 text-xl font-bold text-center mx-1'
                            style={{ width: DAY_SIZE }}
                        >
                            {weekDay}
                        </Text>
                    ))
                }
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {
                    summary &&
                    <View className='flex-row flex-wrap'>
                        {
                            datesFromYearStart.map(date => {
                                const dayWithHabits = summary.find(day => {
                                    console.log('Comparing:', dayjs(date).format('YYYY-MM-DD'), 'with:', dayjs(day.date).format('YYYY-MM-DD'))
                                    return dayjs(date).isSame(day.date, 'day')
                                })

                                return (
                                    <HabitDay
                                        key={date.toISOString()}
                                        date={date}
                                        amountOfHabits={dayWithHabits?.amount}
                                        amountCompleted={dayWithHabits?.completed}
                                        onPress={() => navigate('habit', { date: date.toISOString() })}
                                    />
                                )
                            })
                        }
                        
                        {
                            amountOfDaysToFill > 0 && Array
                            .from({ length: amountOfDaysToFill })
                            .map(( _, index) => (
                                <View 
                                    key={index}
                                    className='bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40'
                                    style={{ width: DAY_SIZE, height: DAY_SIZE }}
                                />
                            ))
                        }
                    </View>
                }
            </ScrollView>
        </View>
    )
}
