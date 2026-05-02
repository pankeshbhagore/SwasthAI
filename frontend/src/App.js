import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";

import Layout from "./components/Layout/Layout";
import OfflineBanner from "./components/UI/OfflineBanner";
import JarvisVoiceAssistant from "./components/UI/JarvisVoiceAssistant";
import CallNotification from "./components/Communication/CallNotification";
import ChatInterface from "./components/Communication/ChatInterface";
import { io } from "socket.io-client";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmergencyPage from "./pages/EmergencyPage";
import NotFoundPage from "./pages/NotFoundPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import AnalyzePage from "./pages/AnalyzePage";
import HospitalsPage from "./pages/HospitalsPage";
import ReportPage from "./pages/ReportPage";
import ProfilePage from "./pages/ProfilePage";
import VitalsPage from "./pages/VitalsPage";
import MedicationPage from "./pages/MedicationPage";
import MentalHealthPage from "./pages/MentalHealthPage";
import NutritionPage from "./pages/NutritionPage";
import MLDemoPage from "./pages/MLDemoPage";
import WellnessPage from "./pages/WellnessPage";
import HistoryPage from "./pages/HistoryPage";
import FamilyDoctorPage from "./pages/FamilyDoctorPage";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = React.useState(null);
  const [activeCall, setActiveCall] = React.useState(null);
  const socketRef = React.useRef(null);

  React.useEffect(() => {
    if (user) {
      const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000");
      socketRef.current = socket;
      socket.emit("join-room", user._id);
      
      socket.on("incoming-call", (data) => {
        setIncomingCall(data);
      });

      return () => socket.disconnect();
    }
  }, [user]);

  return (
    <>
      <AnimatePresence>
        {incomingCall && (
          <CallNotification 
            call={incomingCall} 
            onAccept={() => {
              setActiveCall({ user: { _id: incomingCall.from, name: incomingCall.fromName }, type: incomingCall.type });
              setIncomingCall(null);
            }}
            onReject={() => setIncomingCall(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeCall && (
          <ChatInterface 
            otherUser={activeCall.user} 
            type={activeCall.type} 
            onClose={() => setActiveCall(null)} 
          />
        )}
      </AnimatePresence>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/emergency" element={<EmergencyPage />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="analyze" element={<AnalyzePage />} />
          <Route path="vitals" element={<VitalsPage />} />
          <Route path="medications" element={<MedicationPage />} />
          <Route path="mental-health" element={<MentalHealthPage />} />
          <Route path="nutrition" element={<NutritionPage />} />
          <Route path="hospitals" element={<HospitalsPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="ml-demo" element={<MLDemoPage />} />
          <Route path="wellness" element={<WellnessPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="family-doctor" element={<FamilyDoctorPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

const ThemedToaster = () => {
  const { isDarkMode } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDarkMode ? "#0f1e30" : "#ffffff",
          color: isDarkMode ? "#e8f4fd" : "#0f172a",
          border: isDarkMode ? "1px solid rgba(0,229,255,0.2)" : "1px solid rgba(2,132,199,0.15)",
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "14px",
          boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.08)",
        },
      }}
    />
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <OfflineBanner />
            <JarvisVoiceAssistant />
            <AppRoutes />
            <ThemedToaster />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
