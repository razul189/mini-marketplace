import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { fetchUser, logout } from "../store/authSlice";
import router from "./routes";
import { useNavigate } from "react-router-dom";

const App = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);

  const navigate = useNavigate();

  useEffect(() => {
    const initializeUser = async () => {
      if (isAuthenticated && token && !user) {
        try {
          const resultAction = await dispatch(fetchUser());
          if (fetchUser.rejected.match(resultAction)) {
            dispatch(logout());
            navigate("/login");
          }
        } catch (err) {
          console.error("Failed to fetch user:", err);
        }
      }
    };

    initializeUser();
  }, [dispatch, isAuthenticated, token, user, navigate]);

  return <RouterProvider router={router} />;
};

export default App;
