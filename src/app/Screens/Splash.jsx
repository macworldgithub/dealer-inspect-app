import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; 
import tw from 'tailwind-react-native-classnames';
import { theme } from '../utils/theme';
const Splash = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
      <LinearGradient
      colors={theme.gradients.splash} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={tw`flex-1 items-center justify-center`}
    >
      {/* Logo */}
      <View style={tw`items-center`}>
        <Image
          source={require('../../assets/Logo.png')}
          style={[tw`mb-3`, { width: 180, height: 180 }]} // w-28 h-28
          resizeMode="contain"
        />
      
      </View>
    </LinearGradient>
  );
};

export default Splash;
