import { Check } from 'phosphor-react'
import { FormEvent, useState } from 'react'
import { api } from '../lib/axios'
import dayjs from 'dayjs'

export function NewTaskForm() {
    const [title, setTitle] = useState('')
    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))

    async function createNewTask(event: FormEvent) {
        event.preventDefault()

        if (!title || !date) {
            return
        }

        const formattedDate = dayjs(date).startOf('day').add(3, 'hour').toISOString()  // Formatar a data

        try {
            console.log("Sending data:", { title, date: formattedDate })  // Log para verificar os dados enviados

            await api.post('single-task', {
                title,
                date: formattedDate
            })

            setTitle('')
            setDate(dayjs().format('YYYY-MM-DD'))

            alert('Tarefa criada com sucesso!')
        } catch (error) {
            console.error("Error creating task:", error)
            alert('Erro ao criar tarefa')
        }
    }

    return (
        <form onSubmit={createNewTask} className='w-full flex flex-col mt-6'>
            <label htmlFor='title' className='font-semibold leading-tight'>
                Qual sua tarefa?
            </label>

            <input
                type='text'
                id='title'
                placeholder='ex.: Estudar, trabalhar, etc...'
                className='p-4 rounded-lg mt-3 bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-zinc-900'
                autoFocus
                value={title}
                onChange={event => setTitle(event.target.value)}
            />

            <label htmlFor='date' className='font-semibold leading-tight mt-4'>
                Qual a data?
            </label>

            <input
                type='date'
                id='date'
                className='p-4 rounded-lg mt-3 bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-zinc-900'
                value={date}
                onChange={event => setDate(event.target.value)}
            />

            <button type='submit' className='mt-6 rounded-lg p-4 flex items-center justify-center gap-3 font-semibold bg-green-600 hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-zinc-900'>
                <Check size={20} weight='bold' />
                Confirmar
            </button>
        </form>
    )
}
