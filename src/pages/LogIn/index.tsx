import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../axios";
import { useAuth } from "../../context/AuthContext";

type LoginFormData = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    id: number;
  };
};

const Login: React.FC = () => {
  const { register, handleSubmit } = useForm<LoginFormData>();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation<LoginResponse, Error, LoginFormData>({
    mutationFn: async (data: LoginFormData) => {
      const response = await api.post<LoginResponse>("/login", data);
      return response.data;
    },
    onSuccess: (response) => {
      setErrorMessage(null); 
      login(response.accessToken, response.user); 
    },
    onError: (error: any) => {
      const apiErrorMessage = error?.response?.data || "Login failed. Please try again.";
      setErrorMessage(apiErrorMessage); 
    },
  });

  const onSubmit = (data: LoginFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-xl font-bold mb-4">Login</h1>

        {errorMessage && (
          <div className="mb-4 p-2 text-red-700 bg-red-100 border border-red-400 rounded">
            {errorMessage}
          </div>
        )}

        <input
          {...register("email", { required: true })}
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-4"
        />
        <input
          {...register("password", { required: true })}
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-4"
        />
        <button
          type="submit"
          className="w-full bg-blue-400 text-white p-2 rounded"
        >
          Login
        </button>

        <div className="mt-4 text-center">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
