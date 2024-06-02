import { TouchableOpacity, View, Text } from 'react-native'
import Logo from '../assets/logo.svg'
import { Feather } from '@expo/vector-icons'
import colors from 'tailwindcss/colors'
import { useNavigation } from '@react-navigation/native'

export function Header() {
    const { navigate } = useNavigation()

    return(
        <View className='w-full items-center'>
            <Logo />

            <View className='mt-4'>
                <TouchableOpacity
                    activeOpacity={0.7}
                    className='flex-row h-11 px-4 border border-violet-500 rounded-lg items-center mb-2'
                    onPress={() => navigate('new')}
                >
                    <Feather
                        name='plus'
                        color={colors.violet[500]}
                        size={20}
                    />
                    <Text className='text-white ml-3 font-semibold text-base'>
                        Novo Hábito
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.7}
                    className='flex-row h-11 px-4 border border-violet-500 rounded-lg items-center'
                    onPress={() => navigate('single')}
                >
                    <Feather
                        name='plus'
                        color={colors.violet[500]}
                        size={20}
                    />
                    <Text className='text-white ml-3 font-semibold text-base'>
                        Nova Tarefa
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
