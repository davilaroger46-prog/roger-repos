import { useState } from "react";
import { T } from "../constants/theme";
import { loginUser, registerUser, setToken } from "../services/api";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        mode === "login"
          ? await loginUser({ email, password })
          : await registerUser({ name, email, password });

      setToken(data.access_token);
      onAuth();
    } catch (err) {
      setError(err.message || "Erro de autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          background: T.s1,
          border: `1px solid ${T.b2}`,
          borderRadius: 22,
          padding: 26,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: T.blue,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: ".16em",
            marginBottom: 10,
          }}
        >
          OrthoStudy
        </div>

        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 30,
            marginBottom: 8,
          }}
        >
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>

        <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
          Acesse sua biblioteca clínica ortopédica com casos salvos, versões e PDFs.
        </p>

        {mode === "register" && (
          <Field label="Nome" value={name} onChange={setName} />
        )}

        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Senha" value={password} onChange={setPassword} type="password" />

        {error && (
          <div
            style={{
              background: "rgba(225,29,72,.08)",
              border: "1px solid rgba(225,29,72,.25)",
              borderRadius: 10,
              padding: 10,
              color: "#fca5a5",
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading || !email || !password || (mode === "register" && !name)}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            border: "none",
            background: loading ? T.s2 : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
            color: "#fff",
            fontWeight: 900,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            marginBottom: 14,
          }}
        >
          {loading ? "Processando..." : mode === "login" ? "Entrar" : "Cadastrar"}
        </button>

        <button
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          style={{
            background: "none",
            border: "none",
            color: T.cyan,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {mode === "login"
            ? "Ainda não tenho conta"
            : "Já tenho conta"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div
        style={{
          fontSize: 10,
          color: T.muted,
          fontWeight: 800,
          textTransform: "uppercase",
          marginBottom: 5,
        }}
      >
        {label}
      </div>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: T.s2,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "10px 12px",
          color: T.text,
          outline: "none",
        }}
      />
    </label>
  );
}
