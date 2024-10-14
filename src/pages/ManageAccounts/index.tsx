import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext"; 

type AccountFormData = {
  firstName: string;
  lastName: string;
  currentPassword: string;
  newPassword: string;
};

const ManageMyAccount: React.FC = () => {
  const { user, login, authToken } = useAuth(); 
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<AccountFormData>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  const onSubmit = (data: AccountFormData) => {
    console.log("Form data submitted: ", data); // Log the form data
    setSuccessMessage("Account details updated successfully!");
    setErrorMessage(null);

    login(authToken!, {
      ...user,
      firstName: data.firstName,
      lastName: data.lastName,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Manage My Account</h1>

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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-semibold">First Name</label>
            <input
              {...register("firstName")}
              type="text"
              placeholder="First Name"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold">Last Name</label>
            <input
              {...register("lastName")}
              type="text"
              placeholder="Last Name"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold">Current Password</label>
            <input
              {...register("currentPassword")}
              type="password"
              placeholder="Current Password"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold">New Password</label>
            <input
              {...register("newPassword")}
              type="password"
              placeholder="New Password (Optional)"
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Update Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageMyAccount;
