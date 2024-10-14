import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthGuard from "./AuthGaurd";
import Layout from "./Layout";
import BookDetail from "./pages/BookDetails";
import Books from "./pages/Books";
import Login from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import PrivateRoutes from "./PrivateRoutes";
import RedirectHandler from "./RedirectHandler";
import ManageMyAccount from "./pages/ManageAccounts";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <RedirectHandler />,
      },
      {
        path: "/signup",
        element: <AuthGuard component={<SignUp />} />,
      },
      {
        path: "/login",
        element: <AuthGuard component={<Login />} />,
      },
      {
        element: <PrivateRoutes />,
        children: [
          {
            path: "/books",
            element: <Books />,
          },
          {
            path: "/books/:id",
            element: <BookDetail />,
          },
          {
            path: "/manage-account",
            element: <ManageMyAccount />,
          },
        ],
      },
    ],
  },
]);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
