
import React from "react";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PasswordReset from "./pages/PasswordReset";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import LessonPage from "./pages/LessonPage";
import MyCourses from "./pages/MyCourses";
import Community from "./pages/Community";
import Integration from "./pages/Integration";
import Team from "./pages/Team";
import TeamMemberProfile from "./pages/TeamMemberProfile";
import Documents from "./pages/Documents";
import Notes from "./pages/Notes";
import School from "./pages/School";
import Access from "./pages/Access";
import CompanyPage from "./pages/CompanyPage";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Manifesto from "./pages/Manifesto";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/reset-password" element={<ResetPasswordConfirm />} />
      <Route path="/onboarding" element={<Onboarding />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute element={<Dashboard />} />
        } 
      />
      <Route 
        path="/courses" 
        element={
          <ProtectedRoute element={<Courses />} />
        } 
      />
      <Route 
        path="/courses/:courseId" 
        element={
          <ProtectedRoute element={<CourseDetails />} />
        } 
      />
      <Route 
        path="/lessons/:lessonId" 
        element={
          <ProtectedRoute element={<LessonPage />} />
        } 
      />
      <Route 
        path="/my-courses" 
        element={
          <ProtectedRoute element={<MyCourses />} />
        } 
      />
      <Route 
        path="/community" 
        element={
          <ProtectedRoute element={<Community />} />
        } 
      />
      <Route 
        path="/integration" 
        element={
          <ProtectedRoute element={<Integration />} />
        } 
      />
      <Route 
        path="/team" 
        element={
          <ProtectedRoute element={<Team />} />
        } 
      />
      <Route 
        path="/team/:userId" 
        element={
          <ProtectedRoute element={<TeamMemberProfile />} />
        } 
      />
      <Route 
        path="/documents" 
        element={
          <ProtectedRoute element={<Documents />} />
        } 
      />
      <Route 
        path="/notes" 
        element={
          <ProtectedRoute element={<Notes />} />
        } 
      />
      <Route 
        path="/school" 
        element={
          <ProtectedRoute element={<School />} />
        } 
      />
      <Route 
        path="/access" 
        element={
          <ProtectedRoute element={<Access />} />
        } 
      />
      <Route 
        path="/company" 
        element={
          <ProtectedRoute element={<CompanyPage />} />
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute element={<Admin />} />
        } 
      />
      
      {/* Public routes */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="/manifesto" element={<Manifesto />} />
      
      {/* Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
