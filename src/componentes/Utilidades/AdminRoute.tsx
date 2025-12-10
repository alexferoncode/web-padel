import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, profile, loading } = useAuth(); // Supongo que profile está en tu context

  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: 40 }}>
        Cargando...
      </div>
    );
  }

  // Si no hay usuario logueado, redirige al login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si el usuario no es admin, redirige a "/"
  if (profile?.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Si es admin, renderiza el contenido
  return <>{children}</>;
}
