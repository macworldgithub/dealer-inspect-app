import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeAuthData = async (token, user) => {
  try {
    await AsyncStorage.setItem("access_token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error saving auth data", error);
  }
};

export const getAccessToken = async () => {
  return await AsyncStorage.getItem("access_token");
};

export const clearAuthData = async () => {
  await AsyncStorage.removeItem("access_token");
  await AsyncStorage.removeItem("user");
};
