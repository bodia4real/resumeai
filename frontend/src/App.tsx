import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Applications from "@/pages/Applications";
import ApplicationForm from "@/pages/ApplicationForm";
import Analytics from "@/pages/Analytics";
import AITools from "@/pages/AITools";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

function AppRoutes() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <>
      {isLoggedIn && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Home />} />
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register />}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <Dashboard />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <Applications />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/new"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <ApplicationForm />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/:id/edit"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <ApplicationForm />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <Analytics />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-tools"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <AITools />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <Profile />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
