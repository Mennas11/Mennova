import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import ProductDetails from "./Pages/ProductDetails";
import Favorites from "./Pages/Favorites";
import Cart from "./Pages/Cart";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Quiz from "./Pages/Quiz";
import ProtectedRoute from "./Pages/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "products", element: <Products /> },
      { path: "products/:id", element: <ProductDetails /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "quiz", element: <Quiz /> },
          { path: "favorites", element: <Favorites /> },
          { path: "cart", element: <Cart /> },
        ],
      },
    ],
  },
]);

export default router;