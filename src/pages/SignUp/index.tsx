import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import api from "../../axios";

type SignUpFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type SignUpResponse = {
  success: boolean;
  message: string;
};

const SignUp: React.FC = () => {
  const { register, handleSubmit } = useForm<SignUpFormData>();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation<SignUpResponse, Error, SignUpFormData>({
    mutationFn: async (data: SignUpFormData) => {
      const response = await api.post<SignUpResponse>("/register", data);
      return response.data;
    },
    onSuccess: (response) => {
      setErrorMessage(null);
      setSuccessMessage(response.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
    onError: (error: any) => {
      const apiErrorMessage =
        error?.response?.data || "Sign up failed. Please try again.";
      setSuccessMessage(null);
      setErrorMessage(apiErrorMessage);
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-xl font-bold mb-4">Sign Up</h1>

        {successMessage && (
          <div className="mb-4 p-2 text-green-700 bg-green-100 border border-green-400 rounded">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-2 text-red-700 bg-red-100 border border-red-400 rounded">
            {errorMessage}
          </div>
        )}

        <input
          {...register("firstName", { required: true })}
          placeholder="First Name"
          className="w-full p-2 border rounded mb-4"
        />
        <input
          {...register("lastName", { required: true })}
          placeholder="Last Name"
          className="w-full p-2 border rounded mb-4"
        />
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
          Sign Up
        </button>

        <div className="mt-4 text-center">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
