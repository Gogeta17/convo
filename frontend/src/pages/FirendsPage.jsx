import React, { useEffect, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { getFriendRequests, getUserFriends, acceptFriendRequest } from "../lib/api"; 
import { UserPlusIcon, MessageCircleIcon } from "lucide-react";
import toast from "react-hot-toast";

const FriendsPage = () => {
  const { authUser } = useAuthUser();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const pending = await getFriendRequests(); 
        const accepted = await getUserFriends();  

        setPendingRequests(pending);
        setFriends(accepted);
      } catch (error) {
        console.error("Error fetching friends:", error);
        toast.error("Could not load friends. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleAccept = async (request) => {
    try {
      // Optimistically update UI
      setPendingRequests((prev) =>
        prev.filter((req) => req._id !== request._id)
      );
      setFriends((prev) => [...prev, request.sender]);

      await acceptFriendRequest(request._id); // API call to accept friend
      toast.success(`You are now friends with ${request.sender.fullName}`);
    } catch (error) {
      // Rollback on error
      setPendingRequests((prev) => [...prev, request]);
      setFriends((prev) => prev.filter((f) => f._id !== request.sender._id));
      toast.error("Failed to accept friend request. Try again.");
    }
  };

  const handleMessage = (userId) => {
    window.location.href = `/chat/${userId}`;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Loading friends...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Friends</h1>

      {/* Pending Friend Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <FriendCard
                key={req._id}
                user={req.sender}
                onMessage={handleMessage}
                onAccept={() => handleAccept(req)}
                showAcceptBtn
                showMessageBtn={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Accepted Friends */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Friends</h2>
        <div className="space-y-3">
          {friends.map((friend) => (
            <FriendCard
              key={friend._id}
              user={friend}
              onMessage={handleMessage}
              showAcceptBtn={false}
              showMessageBtn
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const FriendCard = ({ user, showMessageBtn, showAcceptBtn, onMessage, onAccept }) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-base-100">
      <div className="flex items-center gap-4">
        <div className="avatar">
          <div className="w-12 rounded-full">
            <img src={user.profilePic} alt={user.fullName} />
          </div>
        </div>
        <span className="font-semibold">{user.fullName}</span>
      </div>

      <div className="flex items-center gap-2">
        {showAcceptBtn && (
          <button
            onClick={onAccept}
            className="btn btn-sm btn-success flex items-center gap-2"
          >
            <UserPlusIcon className="size-4" /> Accept
          </button>
        )}
        {showMessageBtn && (
          <button
            onClick={() => onMessage(user._id)}
            className="btn btn-sm btn-primary flex items-center gap-2"
          >
            <MessageCircleIcon className="size-4" /> Message
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
