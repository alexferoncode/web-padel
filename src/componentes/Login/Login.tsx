import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { user: authUser, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [step, setStep] = useState<"form" | "verifyEmail" | "verified">("form");
  const [user, setUser] = useState<any>(null);

  // 🔹 Inicializar user y step según authUser al cargar
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      if (authUser.email_confirmed_at) {
        setStep("verified");
      } else {
        setStep("verifyEmail");
      }
    }
  }, [authUser]);

  // Detectar si viene de verificación: /login?verified=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get("verified");

    if (verified === "1") {
      handleVerificationRedirect();
    }
  }, []);

  const handleVerificationRedirect = async () => {
    try {
      await supabase.auth.refreshSession();
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (data.user?.email_confirmed_at) {
        setUser(data.user);
        setStep("verified");
      }
    } catch (err: any) {
      setErrorMsg("Error verificando la cuenta");
    }
  };

  // ===== LOGIN =====
  const handleLogin = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password) {
      setErrorMsg("Email y contraseña son obligatorios");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Email o contraseña erróneos");
        } else if (error.message.includes("Email not confirmed")) {
          setErrorMsg(
            "Aún no has verificado tu cuenta desde el email que te hemos enviado."
          );
          setStep("verifyEmail");
          return;
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      if (data.user?.email_confirmed_at) {
        setUser(data.user);
        setStep("verified");
      } else {
        setUser(data.user);
        setStep("verifyEmail");
      }
    } catch (error: any) {
      setErrorMsg("Error al iniciar sesión");
    }
  };

  // ===== REGISTRO =====
  const handleRegister = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!firstName || !lastName || !email || !password || !repeatPassword) {
      setErrorMsg("Todos los campos son obligatorios");
      return;
    }

    if (password !== repeatPassword) {
      setErrorMsg("Las contraseñas no coinciden");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?verified=1`,
          data: { first_name: firstName, last_name: lastName },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setStep("verifyEmail");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRepeatPassword("");
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  // ===== CONTINUAR =====
  const handleContinue = async () => {
    setErrorMsg("Verifica tu email y vuelve desde el enlace que te enviamos.");
  };

  // ===== LOGOUT =====
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStep("form");
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="login_div">
      {step === "form" && (
        <>
          <h1 className="login_h1">
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </h1>
          <div className="login_form">
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="login_input"
                />
                <input
                  type="text"
                  placeholder="Apellidos"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="login_input"
                />
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login_input"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login_input"
            />
            {!isLogin && (
              <input
                type="password"
                placeholder="Repetir Contraseña"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="login_input"
              />
            )}

            <button
              onClick={isLogin ? handleLogin : handleRegister}
              className="login_btn"
            >
              {isLogin ? "Iniciar sesión" : "Registrarse"}
            </button>

            {errorMsg && <p className="login_error">{errorMsg}</p>}
            {successMsg && <p className="login_success">{successMsg}</p>}

            <div className="login_switch_div">
              <h3 className="login_switch_h3">
                {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
              </h3>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="login_btn"
              >
                {isLogin ? "Regístrate" : "Inicia sesión"}
              </button>
            </div>
          </div>
        </>
      )}

      {step === "verifyEmail" && (
        <div className="login_form">
          <p style={{ fontSize: "18px", color: "white" }}>
            Te hemos enviado un email para verificar tu cuenta.
          </p>
          <p style={{ fontSize: "18px", color: "white" }}>
            Después de verificarla, volverás aquí automáticamente.
          </p>
          <button onClick={handleContinue} className="login_btn">
            Continuar
          </button>
          {errorMsg && <p className="login_error">{errorMsg}</p>}
        </div>
      )}

      {step === "verified" && user && (
        <div className="login_form">
          <h2 className="login_h2_verificado">
            ¡Bienvenido {user.user_metadata?.first_name || user.email}!
          </h2>
          {/* <button onClick={handleLogout} className="login_btn">
            Cerrar sesión
          </button> */}
        </div>
      )}
    </div>
  );
}
