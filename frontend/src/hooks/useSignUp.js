import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { signup } from "../lib/api";

const useSignUp = () => {
     const queryClient = useQueryClient();
  const {
    isPending,
    error,
    mutate
  } = useMutation({
    mutationFn: signup,
    onSuccess: () =>
      // Refresh auth state and redirect
      queryClient.invalidateQueries({ queryKey: ["authUser"] })
    });
    return {isPending,error,signupMutation:mutate}
};

export default useSignUp;
