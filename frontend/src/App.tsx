import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Warta from "./pages/Warta";
import WartaDetail from "./pages/WartaDetail";
import Organization from "./pages/Organization";
import Event from "./pages/Event";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminJemaat from "./pages/admin/Jemaat";
import AdminWarta from "./pages/admin/Warta";
import AdminEvent from "./pages/admin/Event";
import PageTransition from "./components/PageTransition";
import AdminOrganizationBPMJ from "./pages/admin/OrganizationBPMJ";
import AdminOrganizationPelsus from "./pages/admin/OrganizationPelsus";
import AdminBeritaAcaraKeuangan from "./pages/admin/BeritaAcaraKeuangan";
import AdminBeritaAcaraKeuanganForm from "./pages/admin/BeritaAcaraKeuanganForm";
import AdminUsers from "./pages/admin/Users";
import AdminRoles from "./pages/admin/Roles";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <PageTransition>
        <main className="flex-1">{children}</main>
      </PageTransition>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout>
            <About />
          </PublicLayout>
        }
      />
      <Route
        path="/warta"
        element={
          <PublicLayout>
            <Warta />
          </PublicLayout>
        }
      />
      <Route
        path="/warta/:slug"
        element={
          <PublicLayout>
            <WartaDetail />
          </PublicLayout>
        }
      />
      <Route
        path="/organization"
        element={
          <PublicLayout>
            <Organization />
          </PublicLayout>
        }
      />
      <Route
        path="/event"
        element={
          <PublicLayout>
            <Event />
          </PublicLayout>
        }
      />

      {/* Admin routes */}
      <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <PageTransition><AdminDashboard /></PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/organization/bpmj"
        element={
          <ProtectedRoute permission={["organization.manage"]}>
            <PageTransition><AdminOrganizationBPMJ /></PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/organization/pelsus"
        element={
          <ProtectedRoute permission={["organization.manage"]}>
            <PageTransition><AdminOrganizationPelsus /></PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jemaat"
        element={
          <ProtectedRoute permission={["jemaat.view"]}>
            <PageTransition><AdminJemaat /></PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/warta"
        element={
          <ProtectedRoute permission={["warta.manage"]}>
            <PageTransition><AdminWarta /></PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute permission={["events.manage"]}>
            <PageTransition><AdminEvent /></PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/berita-acara/keuangan"
        element={
          <ProtectedRoute permission={["berita_acara.view"]}>
            <PageTransition><AdminBeritaAcaraKeuangan /></PageTransition>
          </ProtectedRoute>
        }
      />
      {/* ":id" juga menangani "new" */}
      <Route
        path="/admin/berita-acara/keuangan/:id"
        element={
          <ProtectedRoute permission={["berita_acara.view"]}>
            <PageTransition><AdminBeritaAcaraKeuanganForm /></PageTransition>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute permission={["users.manage"]}>
            <PageTransition><AdminUsers /></PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute permission={["roles.manage"]}>
            <PageTransition><AdminRoles /></PageTransition>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
