import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { UsersIcon } from "lucide-react";
import toast from "react-hot-toast";

import FriendCard from "../components/FriendCard";
import UserCard from "../components/UserCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [locallySentRequests, setLocallySentRequests] = useState(() => {
    const saved = localStorage.getItem("locallySentRequests");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Fetch current friends
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // Fetch recommended users
  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  // Fetch outgoing requests from server
  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  // Mutation: send friend request
const { mutate: sendRequestMutation, isPending } = useMutation({
  mutationFn: sendFriendRequest,
  onMutate: async (userId) => {
    // Optimistic UI update
    setLocallySentRequests((prev) => {
      const newSet = new Set(prev);
      newSet.add(userId);
      localStorage.setItem("locallySentRequests", JSON.stringify([...newSet]));
      return newSet;
    });
  },
  onSuccess: () => {
    toast.success("Friend request sent ✅");
    queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
  },
  onError: (error, userId) => {
    const msg = error.message || "";

    if (msg.includes("already")) {
      // 🚨 If request already exists → KEEP it disabled
      toast.error("Friend request already sent 🚫");
      return;
    }

    // Otherwise rollback optimistic update
    setLocallySentRequests((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      localStorage.setItem("locallySentRequests", JSON.stringify([...newSet]));
      return newSet;
    });

    toast.error(msg || "Failed to send request ❌");
  },
});


  // Sync outgoing requests from server
  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs?.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  // Check if request already sent
  const hasRequestBeenSent = (userId) => {
    return outgoingRequestsIds.has(userId) || locallySentRequests.has(userId);
  };

  // Wrapper to trigger mutation
  const handleSendRequest = (userId) => {
    sendRequestMutation(userId);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        {/* Friends Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Your Friends
          </h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        {/* Recommended Users Section */}
        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Meet New Learners
                </h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                No recommendations available
              </h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  hasRequestBeenSent={hasRequestBeenSent(user._id)}
                  onSendRequest={() => handleSendRequest(user._id)}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
