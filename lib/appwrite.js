// Import necessary modules from react-native-appwrite
import {
  Account,
  Client,
  ID,
  Avatars,
  Databases,
  Storage,
  Query,
} from "react-native-appwrite";

// Configuration object for Appwrite services
export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.aora.appwrite",
  projectId: "661eeae85bb09be2ff9f",
  databaseId: "661eec975d86062d3bab",
  userCollectionId: "661eecd75d64463ecb33",
  videoCollectionId: "661eed0c745a6c41ab23",
  storageId: "661eeed988e55cd8bc98",
  chatCollectionId: "66e6af88003ab3bd255d",
  messageCollectionId: "66e6afc6003aa7e2ed91",
};

// Initialize the Appwrite client
const client = new Client();

// Configure the client with project details
client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

// Create instances of Appwrite services
export const account = new Account(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);

/**
 * Create a new user account and profile
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} username - User's chosen username
 * @returns {Promise<Object>} - The created user object
 */
export const createUser = async (email, password, username) => {
  try {
    console.log("Creating new user account...");

    // Create a new account
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username,
    );
    if (!newAccount) throw new Error("Failed to create account");

    // Generate avatar URL
    const avatarUrl = avatars.getInitials(username);
    console.log("Avatar generated");

    // Sign in the new user
    await signIn(email, password);
    console.log("User signed in");

    // Create user profile document
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      },
    );
    console.log("User profile created");

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

/**
 * Sign in a user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} - The created session object
 */
export const signIn = async (email, password) => {
  try {
    console.log("Signing in user:", email);
    const session = await account.createEmailPasswordSession(email, password);
    console.log("Sign in successful");
    return session;
  } catch (error) {
    console.error("Error signing in:", error);
    throw new Error(`Failed to sign in: ${error.message}`);
  }
};

/**
 * Sign out the current user
 * @returns {Promise<Object>} - The deleted session object
 */
export async function signOut() {
  try {
    console.log("Signing out user...");
    const session = await account.deleteSession("current");
    console.log("Sign out successful");
    return session;
  } catch (error) {
    console.error("Error signing out:", error);
    throw new Error(`Failed to sign out: ${error.message}`);
  }
} /**
 * Get the current user's profile
 * @returns {Promise<Object|null>} - The current user's profile or null if not found
 */
export const getCurrentUser = async () => {
  try {
    console.log("Fetching current user...");
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No current account found");

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)],
    );

    if (!currentUser.documents.length)
      throw new Error("User profile not found");

    console.log("Current user fetched successfully");
    return currentUser.documents[0];
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Upload a video and create a video document
 * @param {string} fileUri - The local URI of the video file
 * @param {string} title - The title of the video
 * @param {string} prompt - The prompt associated with the video
 * @param {string} creatorId - The ID of the user uploading the video
 * @returns {Promise<Object>} - The created video document
 */
export const uploadVideo = async (fileUri, title, prompt, creatorId) => {
  try {
    console.log("Uploading video:", { title, creatorId });

    // Upload the video file to storage
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      fileUri,
    );
    console.log("Video file uploaded successfully");

    // Get the video URL
    const videoUrl = storage.getFileView(
      appwriteConfig.storageId,
      uploadedFile.$id,
    );

    // TODO: Implement proper thumbnail generation
    const thumbnailUrl = videoUrl; // For now, we're using the video URL as the thumbnail

    // Create a document in the video collection
    const videoDocument = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      ID.unique(),
      {
        title: title,
        thumbnail: thumbnailUrl,
        prompt: prompt,
        video: videoUrl,
        creator: creatorId,
      },
    );
    console.log("Video document created successfully:", videoDocument.$id);

    return videoDocument;
  } catch (error) {
    console.error("Error uploading video:", error);
    throw new Error(`Failed to upload video: ${error.message}`);
  }
};

/**
 * Get details of a specific video
 * @param {string} videoId - The ID of the video
 * @returns {Promise<Object>} - The video document
 */
export const getVideoDetails = async (videoId) => {
  try {
    console.log("Fetching video details for:", videoId);
    const videoDocument = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      videoId,
    );
    console.log("Video details fetched successfully");
    return videoDocument;
  } catch (error) {
    console.error("Error getting video details:", error);
    throw new Error(`Failed to get video details: ${error.message}`);
  }
};

/**
 * Create a new message in a chat, optionally with a video
 * @param {string} chatId - The ID of the chat
 * @param {string} senderId - The ID of the sender
 * @param {string} senderName - The name of the sender
 * @param {string} message - The text message content
 * @param {Object|null} videoFile - The video file object (null if no video)
 * @param {string} videoTitle - The title of the video (empty if no video)
 * @param {string} videoPrompt - The prompt for the video (empty if no video)
 * @returns {Promise<Object>} - The created message document
 */
export const createMessage = async (
  chatId,
  senderId,
  senderName,
  message,
  videoFile = null,
  videoTitle = "",
  videoPrompt = "",
) => {
  try {
    console.log("Creating message:", {
      chatId,
      senderId,
      senderName,
      message,
      videoFile,
      videoTitle,
      videoPrompt,
    });
    let videoId = null;
    if (videoFile) {
      console.log("Uploading video for message...");
      const uploadedVideo = await uploadVideo(
        videoFile.uri,
        videoTitle,
        videoPrompt,
        senderId,
      );
      videoId = uploadedVideo.$id;
      console.log("Video uploaded successfully:", videoId);
    }

    console.log("Creating message document...");
    const newMessage = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messageCollectionId,
      ID.unique(),
      {
        chatId,
        senderId,
        senderName,
        message,
        videoId,
        timestamp: new Date().toISOString(),
      },
    );
    console.log("Message document created successfully:", newMessage.$id);

    return newMessage;
  } catch (error) {
    console.error("Error creating message:", error);
    throw new Error(`Failed to create message: ${error.message}`);
  }
};

// Export ID and Query for use in other parts of the application
export { ID, Query };
