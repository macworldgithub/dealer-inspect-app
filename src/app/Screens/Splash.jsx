import React, { useEffect } from "react";
import { View, Image } from "react-native";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";

const Splash = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Onboarding");
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={tw`flex-1 bg-white items-center justify-center px-10`}>
  
      {/* Bottom Logo */}
      <View style={tw`absolute bottom-32 items-center`}>
        <Image
          source={require("../../../assets/Logo.png")}
          style={tw`w-44 h-16`}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default Splash;
