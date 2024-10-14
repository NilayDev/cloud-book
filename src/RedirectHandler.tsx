import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const RedirectHandler = () => {
  const { authToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authToken) {
      navigate("/books");
    } else {
      navigate("/login");
    }
  }, [authToken, navigate]);

  return null;
};

export default RedirectHandler;
