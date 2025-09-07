const UserCard = ({ user, hasRequestBeenSent, onSendRequest, isPending }) => {
  return (
    <div className="card bg-base-200 p-4 rounded-xl shadow-md flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <img
          src={user.profilePic || "/default-avatar.png"}
          alt={user.fullName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-bold">{user.fullName}</h3>
          <p className="text-sm opacity-70">
            {user.nativeLanguage} → {user.learningLanguage}
          </p>
        </div>
      </div>

      <button
        onClick={onSendRequest} // ✅ directly calls parent wrapper
        disabled={isPending || hasRequestBeenSent}
        className="btn btn-primary btn-sm"
      >
        {hasRequestBeenSent ? "Requested" : "Add Friend"}
      </button>
    </div>
  );
};

export default UserCard;
