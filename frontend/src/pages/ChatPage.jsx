import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// ✅ keep singleton client
let client;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const { authUser, isLoading: authLoading } = useAuthUser();

  const {
    data: tokenData,
    isLoading: tokenLoading,
    isError: tokenError,
  } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
    retry: false,
  });

  useEffect(() => {
    if (!authUser || !tokenData?.token) return;

    // ✅ reuse client if already exists
    if (!client) {
      client = StreamChat.getInstance(STREAM_API_KEY);
    }

    const setup = async () => {
      try {
        // if already connected, skip reconnect
        if (client.userID === authUser._id) {
          // reuse existing channel
          const channelId = [authUser._id, targetUserId].sort().join("-");
          const currChannel = client.channel("messaging", channelId, {
            members: [authUser._id, targetUserId],
          });
          await currChannel.watch();
          setChatClient(client);
          setChannel(currChannel);
          return;
        }

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (err) {
        // only show toast if not "already connected" error
        if (!String(err.message).includes("connectUser was called twice")) {
          console.error("Stream init failed:", err);
          toast.error("Chat failed to load, please refresh.");
        }
      }
    };

    setup();

    return () => {
      // ⚠️ do NOT disconnect client on unmount in dev
      // (strict mode would cause double mount/unmount)
      // In production, you can safely disconnect if needed.
    };
  }, [authUser, tokenData, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
      toast.success("Video call link sent successfully!");
    }
  };

  if (authLoading || tokenLoading) return <ChatLoader message="Connecting to chat..." />;
  if (tokenError) return <p className="text-red-500">Failed to fetch chat token</p>;
  if (!chatClient || !channel) return <ChatLoader message="Finalizing chat setup..." />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
              <Thread />
            </Window>
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
