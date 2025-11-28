import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../supabaseClient"; // Asegúrate de que tu cliente está exportado aquí

export default function Pagina_Login() {
  return (
    <div style={{ maxWidth: "420px", margin: "96px auto" }}>
      <h1>Supabase + React</h1>
      <p>Sign in via magic link or OAuth providers</p>

      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="dark"
        providers={[]} // opcional: ["google", "github"]
        redirectTo={window.location.origin} // dónde redirige después del login
      />
    </div>
  );
}
