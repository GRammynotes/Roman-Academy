import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const NotFound        = lazy(() => import("@/pages/not-found"));
const LandingPage     = lazy(() => import("@/pages/landing"));
const LoginPage       = lazy(() => import("@/pages/login"));
const ContactPage     = lazy(() => import("@/pages/contact"));
const LeaderboardPage = lazy(() => import("@/pages/leaderboard"));

const TeacherDashboard = lazy(() => import("@/pages/teacher/dashboard"));
const TeacherStudents  = lazy(() => import("@/pages/teacher/students"));
const UploadMarksPage  = lazy(() => import("@/pages/teacher/upload-marks"));
const WhatsAppPage     = lazy(() => import("@/pages/teacher/whatsapp"));
const SchedulePage     = lazy(() => import("@/pages/teacher/schedule"));
const SettingsPage     = lazy(() => import("@/pages/teacher/settings"));
const ChaptersPage     = lazy(() => import("@/pages/teacher/chapters"));

const StudentDashboard = lazy(() => import("@/pages/student/dashboard"));
const StudentTests     = lazy(() => import("@/pages/student/tests"));
const StudentProgress  = lazy(() => import("@/pages/student/progress"));
const StudentProfile   = lazy(() => import("@/pages/student/profile"));
const StudentSettings  = lazy(() => import("@/pages/student/settings"));
const StudentSupport   = lazy(() => import("@/pages/student/support"));

const SearchReports    = lazy(() => import("@/pages/admin/students"));
const TeacherAccess    = lazy(() => import("@/pages/teacher-access"));
const ChangePassword   = lazy(() => import("@/pages/change-password"));

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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading…</div>}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />

        <Route path="/teacher" component={TeacherDashboard} />
        <Route path="/teacher/students" component={TeacherStudents} />
        <Route path="/teacher/upload-marks" component={UploadMarksPage} />
        <Route path="/teacher/whatsapp" component={WhatsAppPage} />
        <Route path="/teacher/chapters" component={ChaptersPage} />
        <Route path="/teacher/schedule" component={SchedulePage} />
        <Route path="/teacher/settings" component={SettingsPage} />

        <Route path="/student" component={StudentDashboard} />
        <Route path="/student/tests" component={StudentTests} />
        <Route path="/student/progress" component={StudentProgress} />
        <Route path="/student/profile" component={StudentProfile} />
        <Route path="/student/settings" component={StudentSettings} />
        <Route path="/student/support" component={StudentSupport} />

        <Route path="/change-password" component={ChangePassword} />
        <Route path="/admin/students" component={SearchReports} />
        <Route path="/teacher-access" component={TeacherAccess} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
