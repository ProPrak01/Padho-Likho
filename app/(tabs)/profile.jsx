import React from "react";
import { useGlobalContext } from "../../context/GlobalProvider";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { signOut } from "../../lib/appwrite";
import { icons } from "../../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const Profile = () => {
  const { user, setUser, setIsLoggedIn } = useGlobalContext();

  const logout = async () => {
    router.replace("/sign-in");
    await signOut();
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1E1E1E]">
      <View className="items-center p-6">
        {/* Profile Image */}
        <View className="w-32 h-32 bg-gray-300 rounded-full overflow-hidden mb-6">
          <Image
            source={icons.profile}
            className="w-1/2 h-1/2 m-auto"
            resizeMode="cover"
          />
        </View>

        {/* Username */}
        <Text className="text-3xl font-pbold text-[#ECDFCC]">
          {user.username}
        </Text>
        {/* Email */}
        <Text className="text-lg font-pregular text-gray-400 mt-2">
          {user.email}
        </Text>

        {/* Bio Section */}
        <View className="mt-6 bg-[#3C3D37] w-full px-6 py-4 rounded-lg">
          <Text className="text-xl font-psemibold text-[#ECDFCC]">Bio</Text>
          <Text className="text-base font-pregular text-gray-300 mt-2">
            {user.bio || "No bio available. Add your bio in settings."}
          </Text>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity className="mt-6 bg-[#3C3D37] px-4 py-2 rounded-full border-[1px] border-[#ECDFCC]">
          <Text className="text-[#ECDFCC] font-pbold">Edit Profile</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={logout}
          className="mt-4 flex flex-row items-center bg-red-600 px-6 py-2 rounded-full"
        >
          <Image
            source={icons.logout}
            className="w-5 h-5 mr-2"
            resizeMode="contain"
          />
          <Text className="text-white font-pbold">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
