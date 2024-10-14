import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const PrivateRoutes = () => {
  const { authToken, logout, user } = useAuth();
  const navigate = useNavigate();

  return authToken ? (
    <>
      <header className="bg-blue-500 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="font-semibold">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-sm text-gray-200">{user?.email}</div>
          </div>

          <div className="space-x-2">
            <button
              onClick={() => navigate('manage-account')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-300 ease-in-out"
            >
              Manage Account
            </button>

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto mt-6 p-4">
        <Outlet />
      </div>
    </>
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoutes;
