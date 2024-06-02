
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { BackButton } from '../components/BackButton'
import { useState } from 'react'
import { Feather } from '@expo/vector-icons'
import colors from 'tailwindcss/colors'
import { api } from '../lib/axios'
import DateTimePicker from '@react-native-community/datetimepicker'

export function NewSingleTask() {
    const [title, setTitle] = useState('')
    const [date, setDate] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)

    async function handleCreateNewSingleTask() {
        try {
            if (!title.trim()) {
                return Alert.alert('Nova tarefa', 'Informe o nome da tarefa e escolha uma data.')
            }

            await api.post('/single-task', { title, date })
            setTitle('')
            setDate(new Date())
            Alert.alert('Nova tarefa', 'Tarefa criada com sucesso!')
        } catch (error) {
            console.log(error)
            Alert.alert('Ops', 'Não foi possível criar a nova tarefa')
        }
    }

    return (
        <View className='flex-1 bg-background px-8 pt-16'>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <BackButton />

                <Text className='mt-6 text-white font-extrabold text-3xl'>
                    Criar tarefa única
                </Text>

                <Text className='mt-6 text-white font-semibold text-base'>
                    Qual é a tarefa?
                </Text>

                <TextInput
                    className='h-12 pl-4 rounded-lg mt-3 bg-zinc-900 text-white border-2 border-zinc-800 focus:border-green-600'
                    placeholder='Estudar para prova, reunião, etc...'
                    placeholderTextColor={colors.zinc[400]}
                    onChangeText={setTitle}
                    value={title}
                />

                <Text className='font-semibold mt-4 mb-3 text-white text-base'>
                    Qual é a data?
                </Text>

                <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)}
                    className='h-12 pl-4 rounded-lg mt-3 bg-zinc-900 text-white border-2 border-zinc-800 flex-row items-center'
                >
                    <Text className='text-white'>{date.toDateString()}</Text>
                    <Feather name='calendar' size={20} color={colors.white} style={{ marginLeft: 'auto', marginRight: 10 }} />
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false)
                            if (selectedDate) {
                                setDate(selectedDate)
                            }
                        }}
                    />
                )}

                <TouchableOpacity 
                    className='w-full h-14 flex-row items-center justify-center bg-green-600 rounded-md mt-6'
                    activeOpacity={0.7}
                    onPress={handleCreateNewSingleTask}
                >
                    <Feather 
                        name='check'
                        size={20}
                        color={colors.white}
                    />
                    <Text className='font-semibold text-base text-white ml-2'>
                        Confirmar
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}
