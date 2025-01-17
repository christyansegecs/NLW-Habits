import { useEffect, useState } from 'react';
import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning';
import { HabitDay } from './HabitDay';
import { api } from '../lib/axios';
import dayjs from 'dayjs';

type Summary = Array<{
    id: string;
    date: string;
    amount: number;
    completed: number;
}>;

const weekDays = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

const summaryDates = generateDatesFromYearBeginning();

const minimumSummaryDatesSize = 52 * 7; // 18 weeks
const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length;

console.log('Summary Dates:', summaryDates);
console.log('Amount of Days to Fill:', amountOfDaysToFill);

export function SummaryTable() {
    const [summary, setSummary] = useState<Summary>([]);

    useEffect(() => {
        api.get('/summary').then((response) => {
            console.log('Summary Data:', response.data);
            setSummary(response.data);
        });
    }, []);

    return (
        <div className='w-full flex'>
            <div className='grid grid-rows-7 grid-flow-row gap-3'>
                {weekDays.map((weekDay, i) => {
                    return (
                        <div
                            key={`${weekDay}-${i}`}
                            className='text-zinc-400 text-xl h-10 w-10 font-bold flex items-center justify-center'
                        >
                            {weekDay}
                        </div>
                    );
                })}
            </div>

            <div className='grid grid-rows-7 grid-flow-col gap-3'>
                {summary.length > 0 && summaryDates.map((date) => {
                    const dayInSummary = summary.find((day) => {
                        return dayjs(date).isSame(day.date, 'day');
                    });

                    return (
                        <HabitDay
                            key={date.toString()}
                            date={date}
                            amount={dayInSummary?.amount}
                            defaultCompleted={dayInSummary?.completed}
                        />
                    );
                })}

                {amountOfDaysToFill > 0 && Array.from({ length: amountOfDaysToFill }).map((_, i) => {
                    return (
                        <div
                            key={i}
                            className='bg-zinc-900 w-10 h-10 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed'
                        />
                    );
                })}
            </div>
        </div>
    );
}
