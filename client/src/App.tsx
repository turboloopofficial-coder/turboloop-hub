import { lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import PageErrorBoundary from "./components/PageErrorBoundary";
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
// Phase 2 pages
const PromotionsPage = lazy(() => import("./pages/PromotionsPage"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const EcosystemPage = lazy(() => import("./pages/EcosystemPage"));
const EcosystemPillarPage = lazy(() => import("./pages/EcosystemPillarPage"));
const FilmsPage = lazy(() => import("./pages/FilmsPage"));
const FilmPlayer = lazy(() => import("./pages/FilmPlayer"));
const SubmitPage = lazy(() => import("./pages/SubmitPage"));
const ComparisonPage = lazy(() => import("./pages/ComparisonPage"));
const Defi101Page = lazy(() => import("./pages/Defi101Page"));
const Defi101LessonPage = lazy(() => import("./pages/Defi101LessonPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function Router() {
  // useLocation gives us the current path so we can key the AnimatePresence
  // child to it — that triggers a fade transition on every route change.
  const [location] = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
      <PageErrorBoundary>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <Switch location={location}>
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
              {/* Phase 2 routes */}
              <Route path="/promotions" component={PromotionsPage} />
              <Route path="/library" component={LibraryPage} />
              <Route path="/faq" component={FaqPage} />
              <Route path="/ecosystem" component={EcosystemPage} />
              <Route path="/ecosystem/:slug" component={EcosystemPillarPage} />
              <Route path="/films" component={() => <FilmsPage />} />
              <Route path="/films/:slug" component={FilmPlayer} />
              <Route path="/submit" component={SubmitPage} />
              <Route path="/vs/:slug" component={ComparisonPage} />
              <Route path="/learn" component={Defi101Page} />
              <Route path="/learn/:slug" component={Defi101LessonPage} />
              {/* Legal */}
              <Route path="/privacy" component={PrivacyPage} />
              <Route path="/terms" component={TermsPage} />
              {/* Admin */}
              <Route
                path="/admin"
                component={() => <Redirect to="/admin/login" />}
              />
              <Route path="/admin/login" component={AdminLogin} />
              <Route path="/admin/:rest*" component={AdminDashboard} />
              <Route path="/404" component={NotFound} />
              <Route component={NotFound} />
            </Switch>
          </motion.div>
        </AnimatePresence>
      </PageErrorBoundary>
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
