import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PageLoader from "./components/PageLoader";
import AnalyticsTracker from "./components/AnalyticsTracker";

// Heavy pages — code-split so they don't bloat the homepage bundle
const FeedPage = lazy(() => import("./pages/FeedPage"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const TopicPage = lazy(() => import("./pages/TopicPage"));
const ReelPage = lazy(() => import("./pages/ReelPage"));
// Dedicated topic pages (Phase 1 of restructure)
const SecurityPage = lazy(() => import("./pages/SecurityPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const CreativesPage = lazy(() => import("./pages/CreativesPage"));
const RoadmapPage = lazy(() => import("./pages/RoadmapPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/feed" component={FeedPage} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/topic/:tag" component={TopicPage} />
        <Route path="/reels/:slug" component={ReelPage} />
        {/* Dedicated topic pages */}
        <Route path="/security" component={SecurityPage} />
        <Route path="/community" component={CommunityPage} />
        <Route path="/creatives" component={CreativesPage} />
        <Route path="/roadmap" component={RoadmapPage} />
        <Route path="/admin" component={() => <Redirect to="/admin/login" />} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/:rest*" component={AdminDashboard} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AnalyticsTracker />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
