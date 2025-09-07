import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("❌ Stream API Key or Secret is missing");
}

const StreamClient = StreamChat.getInstance(apiKey, apiSecret);

/**
 * Upserts (creates/updates) a user in Stream
 * @param {Object} userData - must include at least { id: string }
 * Example: { id: "123", name: "John Doe", email: "john@mail.com" }
 */
export const upsertStreamUser = async (userData) => {
  try {
    if (!userData?.id) {
      throw new Error("userData.id is required for Stream user");
    }

    const response = await StreamClient.upsertUser(userData);
    console.log("✅ Stream user upserted:", response.users[userData.id]);
    return response.users[userData.id];
  } catch (error) {
    console.error("❌ Error upserting Stream user:", error.message);
    throw error;
  }
};

/**
 * Generates a Stream token for a user
 * @param {string} userId - must be a valid Stream user id
 */
export const generateStreamToken = (userId) => {
  try {
    if (!userId) {
      throw new Error("userId is required to generate a token");
    }

    const userIdStr = userId.toString();
    return StreamClient.createToken(userIdStr);
  } catch (error) {
    console.error("❌ Error generating Stream token:", error.message);
    throw error;
  }
};
