import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import ContactPage from "@/pages/contact";
import LeaderboardPage from "@/pages/leaderboard";

import TeacherDashboard from "@/pages/teacher/dashboard";
import TeacherStudents from "@/pages/teacher/students";
import UploadMarksPage from "@/pages/teacher/upload-marks";
import WhatsAppPage from "@/pages/teacher/whatsapp";
import SchedulePage from "@/pages/teacher/schedule";
import SettingsPage from "@/pages/teacher/settings";

import StudentDashboard from "@/pages/student/dashboard";
import StudentTests from "@/pages/student/tests";
import StudentProgress from "@/pages/student/progress";
import StudentProfile from "@/pages/student/profile";
import StudentSettings from "@/pages/student/settings";
import StudentSupport from "@/pages/student/support";

import AdminStudents from "@/pages/admin/students";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />

      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/teacher/students" component={TeacherStudents} />
      <Route path="/teacher/upload-marks" component={UploadMarksPage} />
      <Route path="/teacher/whatsapp" component={WhatsAppPage} />
      <Route path="/teacher/schedule" component={SchedulePage} />
      <Route path="/teacher/settings" component={SettingsPage} />

      <Route path="/student" component={StudentDashboard} />
      <Route path="/student/tests" component={StudentTests} />
      <Route path="/student/progress" component={StudentProgress} />
      <Route path="/student/profile" component={StudentProfile} />
      <Route path="/student/settings" component={StudentSettings} />
      <Route path="/student/support" component={StudentSupport} />

      <Route path="/admin/students" component={AdminStudents} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
