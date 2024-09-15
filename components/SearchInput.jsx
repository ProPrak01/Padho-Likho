import { View, Text, TextInput, TouchableOpacity,Image } from 'react-native'
import React ,{useState} from 'react'
import {icons} from '../constants'
const SearchInput = ({title,value,placeholder,handleChangeText,otherStyles, ...props }) => {
    const [showPassword,setShowPassword] = new useState(false)
  return (
   

      <View className="border-2 border-[#3C3D37] w-full space-x-4 h-16 px-4 bg-[#ECDFCC] rounded-2xl focus:border-secondary items-center flex-row" >
    <TextInput
        className="flex-1 text-[#3C3D37] text-base mt-0.5 font-pregular"
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#3C3D37"
        onChangeText={handleChangeText}
        secureTextEntry = {title === 'Password' && !showPassword}
    />

    <TouchableOpacity>
    </TouchableOpacity>
      </View>
   
  )
}

export default SearchInput