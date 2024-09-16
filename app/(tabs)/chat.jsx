import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalContext } from "../../context/GlobalProvider";
import {
  databases,
  appwriteConfig,
  ID,
  Query,
  createMessage,
  getVideoDetails,
} from "../../lib/appwrite";

import SearchInput from "../../components/SearchInput";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";

const POLLING_INTERVAL = 5000; // Polling interval in milliseconds

const ChatSection = () => {
  const { user } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [newChatModal, setNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [addUserModal, setAddUserModal] = useState(false);
  const [newUserUsername, setNewUserUsername] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  useEffect(() => {
    loadChats();
    const intervalId = setInterval(loadChats, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  const loadChats = async () => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.chatCollectionId,
        [Query.search("participants", user.$id)],
      );
      setChats(response.documents);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  const handleChatPress = async (chat) => {
    setSelectedChat(chat);
    setModalVisible(true);
    await loadMessages(chat.$id);
  };

  const loadMessages = async (chatId) => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.messageCollectionId,
        [Query.equal("chatId", chatId)],
      );
      setMessages(response.documents);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setSelectedVideo(result.uri);
      // Open a modal to input video title and prompt
      Alert.prompt("Video Details", "Enter video title", [
        {
          text: "Cancel",
          onPress: () => setSelectedVideo(null),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: (title) => {
            setVideoTitle(title);
            Alert.prompt("Video Details", "Enter video prompt", [
              {
                text: "Cancel",
                onPress: () => setSelectedVideo(null),
                style: "cancel",
              },
              {
                text: "OK",
                onPress: (prompt) => setVideoPrompt(prompt),
              },
            ]);
          },
        },
      ]);
    }
  };
  const sendMessage = async () => {
    if (newMessage.trim() === "" && !selectedVideo) return;

    try {
      await createMessage(
        selectedChat.$id,
        user.$id,
        user.username,
        newMessage,
        selectedVideo,
        videoTitle,
        videoPrompt,
      );
      console.log("Message sent successfully", videoTitle);
      setNewMessage("");
      setSelectedVideo(null);
      setVideoTitle("");
      setVideoPrompt("");
      await loadMessages(selectedChat.$id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      className="bg-[#3C3D37] border-[#1E201E] border-2 mx-3 p-4 rounded-lg mb-2"
      onPress={() => handleChatPress(item)}
    >
      <Text className="text-lg text-white font-psemibold">{item.Name}</Text>
      <Text className="text-sm text-gray-300">
        {item.isPublic ? "Public" : "Private"}
      </Text>
      <Text className="text-xs text-gray-400 mt-1">
        {new Date(item.$createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
  const [videoPlaybackModal, setVideoPlaybackModal] = useState({
    visible: false,
    videoUrl: "",
    title: "",
    prompt: "",
  });
  const handleVideoPress = async (videoId) => {
    try {
      const videoDetails = await getVideoDetails(videoId);
      setModalVisible(false);
      // Open a new modal to display video details and play the video
      setVideoPlaybackModal({
        visible: true,
        videoUrl: videoDetails.video,
        title: videoDetails.title,
        prompt: videoDetails.prompt,
      });
    } catch (error) {
      console.error("Error fetching video details:", error);
      Alert.alert("Error", "Failed to load video. Please try again.");
    }
  };
  const renderMessageItem = ({ item }) => (
    <View
      className={`p-2 rounded-lg mb-2 ${
        item.senderId === user.$id
          ? "bg-blue-500 self-end"
          : "bg-gray-300 self-start"
      }`}
    >
      {item.videoId ? (
        <TouchableOpacity onPress={() => handleVideoPress(item.videoId)}>
          <Image
            source={{
              uri: item.thumbnail || "https://via.placeholder.com/150",
            }}
            style={{ width: 200, height: 150 }}
            resizeMode="cover"
          />
          <Text className="text-white mt-1">
            {item.videoTitle || "Untitled Video"}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text
          className={item.senderId === user.$id ? "text-white" : "text-black"}
        >
          {item.message}
        </Text>
      )}
      <Text className="text-xs text-gray-500 mt-1">{item.senderName}</Text>
    </View>
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadChats().then(() => setRefreshing(false));
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.Name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const createNewChat = async () => {
    try {
      const newChat = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.chatCollectionId,
        ID.unique(),
        {
          Name: newChatName,
          isPublic: isPublic,
          createdBy: user.$id,
          participants: [user.$id],
        },
      );

      setChats([...chats, newChat]);
      setNewChatModal(false);
      handleChatPress(newChat);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const addUserToChat = async () => {
    try {
      const userResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("username", newUserUsername)],
      );

      if (userResponse.documents.length === 0) {
        Alert.alert(
          "User not found",
          "Please check the username and try again.",
        );
        return;
      }

      const newUserId = userResponse.documents[0].$id;

      if (selectedChat.participants.includes(newUserId)) {
        Alert.alert(
          "User already in chat",
          "This user is already a participant in this chat.",
        );
        return;
      }

      const updatedParticipants = [...selectedChat.participants, newUserId];

      const updatedChat = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.chatCollectionId,
        selectedChat.$id,
        {
          participants: updatedParticipants,
        },
      );

      setSelectedChat(updatedChat);
      setAddUserModal(false);
      setNewUserUsername("");
      Alert.alert("Success", "User added to the chat successfully.");
    } catch (error) {
      console.error("Error adding user to chat:", error);
      Alert.alert("Error", "Failed to add user to the chat. Please try again.");
    }
  };

  return (
    <SafeAreaView className="bg-[#1E201E] h-full">
      <View className="my-6 px-4 space-y-6">
        <View className="justify-between items-start flex-row mb-6">
          <View>
            <Text className="text-2xl font-psemibold text-[#ECDFCC]">
              Chat Section
            </Text>
          </View>
          <TouchableOpacity
            className="bg-accent py-2 px-4 rounded-full border-[1px] border-[#ECDFCC] bg-[#3C3D37]"
            onPress={() => setNewChatModal(true)}
          >
            <Text className="text-[#ECDFCC] font-pbold">New Chat</Text>
          </TouchableOpacity>
        </View>
        <SearchInput
          value={searchQuery}
          handleChangeText={setSearchQuery}
          placeholder={"Search Chats..."}
        />
        <View className="w-full pt-5 flex-1 pb-8">
          <Text className="text-gray-100 text-lg font-pregular mb-4">
            Your Chats
          </Text>
        </View>
      </View>
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.$id}
        ListEmptyComponent={() => (
          <View>
            <Text className="text-gray-300 text-lg font-pregular text-center">
              No chats found
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ffffff"]}
            tintColor="#ffffff"
          />
        }
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-[#1E201E]">
          <SafeAreaView className="flex-1">
            <View className="flex-row justify-between items-center p-4 bg-[#3C3D37] pt-9">
              <Text className="text-[#ECDFCC] text-lg font-pbold">
                {selectedChat?.Name}
              </Text>
              {!selectedChat?.isPublic && (
                <TouchableOpacity
                  className="bg-accent py-2 px-4 rounded-full border-[1px] border-[#ECDFCC]"
                  onPress={() => setAddUserModal(true)}
                >
                  <Text className="text-[#ECDFCC]">Add User</Text>
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={messages}
              renderItem={renderMessageItem}
              keyExtractor={(item) => item.$id}
              contentContainerStyle={{ padding: 10 }}
              inverted
            />
            <View className="flex-row items-center p-4 bg-[#3C3D37]">
              <TextInput
                className="flex-1 bg-gray-700 text-white p-2 rounded-lg"
                placeholder="Type your message..."
                placeholderTextColor="#aaaaaa"
                value={newMessage}
                onChangeText={setNewMessage}
              />
              <TouchableOpacity
                className="ml-4 bg-accent py-2 px-4 rounded-full border-[1px] border-[#ECDFCC]"
                onPress={pickVideo}
              >
                <Text className="text-[#ECDFCC] font-pbold">Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-4 bg-accent py-2 px-4 rounded-full border-[1px] border-[#ECDFCC]"
                onPress={sendMessage}
              >
                <Text className="text-[#ECDFCC] font-pbold">Send</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-4 bg-accent py-2 px-4 rounded-full border-[1px] border-[#ECDFCC]"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-[#ECDFCC]">Close</Text>
              </TouchableOpacity>
            </View>
            {selectedVideo && (
              <View className="p-2 bg-[#3C3D37]">
                <Text className="text-[#ECDFCC]">Selected video:</Text>
                <Image
                  source={{ uri: selectedVideo }}
                  style={{ width: 100, height: 100 }}
                  resizeMode="cover"
                />
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={newChatModal}
        onRequestClose={() => setNewChatModal(false)}
      >
        <View className="flex-1 bg-[#1E201E] justify-center items-center">
          <View className="bg-[#3C3D37] p-4 rounded-lg w-4/5">
            <Text className="text-[#ECDFCC] text-lg font-pbold mb-4">
              Create a new chat
            </Text>
            <TextInput
              className="bg-gray-700 text-white p-2 rounded-lg mb-4"
              placeholder="Enter chat name"
              placeholderTextColor="#aaaaaa"
              value={newChatName}
              onChangeText={setNewChatName}
            />
            <View className="flex-row items-center mb-4">
              <Text className="text-[#ECDFCC] mr-2">Public:</Text>
              <TouchableOpacity
                onPress={() => setIsPublic(!isPublic)}
                className={`w-6 h-6 rounded ${
                  isPublic ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </View>
            <TouchableOpacity
              className="bg-accent py-2 px-4 rounded-full border-[1px] border-[#ECDFCC]"
              onPress={createNewChat}
            >
              <Text className="text-[#ECDFCC] font-pbold text-center">
                Create Chat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mt-2 py-2 px-4 rounded-full border-[1px] border-[#ECDFCC]"
              onPress={() => setNewChatModal(false)}
            >
              <Text className="text-[#ECDFCC] text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={addUserModal}
        onRequestClose={() => setAddUserModal(false)}
      >
        <View className="flex-1 bg-[#1E201E] justify-center items-center">
          <View className="bg-[#3C3D37] p-4 rounded-lg w-4/5">
            <Text className="text-[#ECDFCC] text-lg font-pbold mb-4">
              Add user to chat
            </Text>
            <TextInput
              className="bg-gray-700 text-white p-2 rounded-lg mb-4"
              placeholder="Enter username"
              placeholderTextColor="#aaaaaa"
              value={newUserUsername}
              onChangeText={setNewUserUsername}
            />
            <TouchableOpacity
              className="bg-accent py-2 px-4 rounded-full border-[1px] border-[#ECDFCC]"
              onPress={addUserToChat}
            >
              <Text className="text-[#ECDFCC] font-pbold text-center">
                Add User
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mt-2 py-2 px-4 rounded-full border-[1px] border-[#ECDFCC]"
              onPress={() => setAddUserModal(false)}
            >
              <Text className="text-[#ECDFCC] text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-[#1E201E]">
          <SafeAreaView className="flex-1">
            {/* ... (keep existing modal content) */}
            <View className="flex-row items-center p-4 bg-[#3C3D37]">
              <TextInput
                className="flex-1 bg-gray-700 text-white p-2 rounded-lg"
                placeholder="Type your message..."
                placeholderTextColor="#aaaaaa"
                value={newMessage}
                onChangeText={setNewMessage}
              />
              <TouchableOpacity
                className="ml-4 bg-accent py-2 px-4 rounded-full border-[1px] border-[#ECDFCC]"
                onPress={pickVideo}
              >
                <Text className="text-[#ECDFCC] font-pbold">Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-4 bg-accent py-2 px-4 rounded-full border-[1px] border-[#ECDFCC]"
                onPress={sendMessage}
              >
                <Text className="text-[#ECDFCC] font-pbold">Send</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-4 bg-accent py-2 px-4 rounded-full border-[1px] border-[#ECDFCC]"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-[#ECDFCC]">Close</Text>
              </TouchableOpacity>
            </View>
            {selectedVideo && (
              <View className="p-2 bg-[#3C3D37]">
                <Text className="text-[#ECDFCC]">Selected video:</Text>
                <Image
                  source={{ uri: selectedVideo }}
                  style={{ width: 100, height: 100 }}
                  resizeMode="cover"
                />
                <Text className="text-[#ECDFCC]">Title: {videoTitle}</Text>
                <Text className="text-[#ECDFCC]">Prompt: {videoPrompt}</Text>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={videoPlaybackModal.visible}
        onRequestClose={() =>
          setVideoPlaybackModal({ ...videoPlaybackModal, visible: false })
        }
      >
        <View className="flex-1 bg-[#1E201E] justify-center items-center">
          <View className="bg-[#3C3D37] p-4 rounded-lg w-11/12">
            <Text className="text-[#ECDFCC] text-lg font-pbold mb-4">
              {videoPlaybackModal.title}
            </Text>
            <Text className="text-[#ECDFCC] mb-2">
              Prompt: {videoPlaybackModal.prompt}
            </Text>
            <Video
              source={{ uri: videoPlaybackModal.videoUrl }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="contain"
              shouldPlay
              useNativeControls
              style={{ width: "100%", height: 300 }}
            />
            <TouchableOpacity
              className="mt-4 py-2 px-4 rounded-full border-[1px] border-[#ECDFCC]"
              onPress={() =>
                setVideoPlaybackModal({ ...videoPlaybackModal, visible: false })
              }
            >
              <Text className="text-[#ECDFCC] text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ChatSection;
