import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  // useQuery returns { data, isLoading, error, ... }
  const { data, isLoading, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
  });

  return {
    isLoading,
    authUser: data?.user || null, // Safe fallback
    error,
  };
};

export default useAuthUser;
