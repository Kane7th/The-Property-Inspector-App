import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NewInspection from "./pages/NewInspection.jsx";
import { getToken } from "./utils/auth.js";

export default function App() {
  const PrivateRoute = ({ children }) => {
    return getToken() ? children : <Navigate to="/login" />;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/new-inspection"
        element={
          <PrivateRoute>
            <NewInspection />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
