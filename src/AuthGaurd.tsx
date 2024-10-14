import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const AuthGuard = ({ component }: any) => {
  const { authToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authToken) {
      navigate("/books");
    }
  }, [authToken, navigate]);

  return !authToken ? component : null;
};

export default AuthGuard;
