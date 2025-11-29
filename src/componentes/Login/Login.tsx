import { useState } from "react";
import { supabase } from "../../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

      if (error) throw error;

      setSuccessMsg("¡Has iniciado sesión correctamente!");
    } catch (error: any) {
      setErrorMsg(error.message);
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
      });

      if (error) throw error;

      await supabase.from("profiles").insert({
        id: data.user?.id,
        email,
        first_name: firstName,
        last_name: lastName,
      });

      setSuccessMsg("Registro exitoso. Revisa tu email para confirmar.");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRepeatPassword("");
      setIsLogin(true);
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  // ===== LOGOUT =====
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (user) {
    return (
      <div className="login-container">
        <h1 className="login-title">Bienvenido, {user.email}</h1>
        <button onClick={handleLogout} className="login-btn">
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h1 className="login-title">{isLogin ? "Iniciar sesión" : "Registro"}</h1>

      <div className="login-form">
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="login-input"
            />
            <input
              type="text"
              placeholder="Apellidos"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="login-input"
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />

        {!isLogin && (
          <input
            type="password"
            placeholder="Repetir Contraseña"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className="login-input"
          />
        )}

        <button
          onClick={isLogin ? handleLogin : handleRegister}
          className="login-btn"
        >
          {isLogin ? "Iniciar sesión" : "Registrarse"}
        </button>

        {errorMsg && <p className="login-error">{errorMsg}</p>}
        {successMsg && <p className="login-success">{successMsg}</p>}

        <p className="login-switch">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="login-switch-btn"
          >
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
