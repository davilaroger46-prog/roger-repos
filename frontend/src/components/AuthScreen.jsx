import { useState, useEffect, useRef } from "react";
import { T } from "../constants/theme";
import { loginUser, registerUser } from "../services/api";

function passwordStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^\w\s]/.test(pwd)) score++;
  const levels = [
    { label: "", color: "transparent" },
    { label: "Muito fraca", color: T.red },
    { label: "Fraca", color: T.amber },
    { label: "Razoável", color: T.amber },
    { label: "Boa", color: T.green },
    { label: "Forte", color: T.cyan },
  ];
  return { score, ...levels[score] };
}

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const timerRef = useRef(null);

  const strength = passwordStrength(password);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startLockoutTimer = (seconds) => {
    setLockoutSeconds(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setLockoutSeconds((s) => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const submit = async () => {
    if (lockoutSeconds > 0) return;
    try {
      setLoading(true);
      setError("");
      if (mode === "login") {
        await loginUser({ email, password });
      } else {
        await registerUser({ name, email, password });
      }
      onAuth();
    } catch (err) {
      const retryAfter = err.details?.retry_after;
      if (retryAfter) {
        startLockoutTimer(retryAfter);
        setError(`Conta bloqueada. Tente novamente em ${retryAfter}s.`);
      } else if (err.details?.password) {
        setError(err.details.password.join(" "));
      } else {
        setError(err.message || "Erro de autenticação");
      }
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockoutSeconds > 0;
  const isDisabled = loading || isLocked || !email || !password || (mode === "register" && !name);

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
        <div style={{ fontSize: 11, color: T.blue, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".16em", marginBottom: 10 }}>
          OrthoStudy
        </div>

        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, marginBottom: 8 }}>
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

        {mode === "register" && password && (
          <div style={{ marginTop: -6, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 99,
                  background: i <= strength.score ? strength.color : T.border,
                  transition: "background .2s",
                }} />
              ))}
            </div>
            {strength.label && (
              <div style={{ fontSize: 10, color: strength.color, fontWeight: 700 }}>
                {strength.label}
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{
            background: "rgba(225,29,72,.08)", border: "1px solid rgba(225,29,72,.25)",
            borderRadius: 10, padding: 10, color: "#fca5a5", fontSize: 12, marginBottom: 12,
          }}>
            {isLocked ? `🔒 ${error} (${lockoutSeconds}s)` : error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={isDisabled}
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 12, border: "none",
            background: isDisabled ? T.s2 : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
            color: isDisabled ? T.muted : "#fff",
            fontWeight: 900, cursor: isDisabled ? "not-allowed" : "pointer",
            marginBottom: 14, transition: "background .2s",
          }}
        >
          {isLocked ? `Bloqueado (${lockoutSeconds}s)` : loading ? "Processando..." : mode === "login" ? "Entrar" : "Cadastrar"}
        </button>

        <button
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setPassword(""); }}
          style={{ background: "none", border: "none", color: T.cyan, cursor: "pointer", fontSize: 12, fontWeight: 800 }}
        >
          {mode === "login" ? "Ainda não tenho conta" : "Já tenho conta"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: T.muted, fontWeight: 800, textTransform: "uppercase", marginBottom: 5 }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", background: T.s2, border: `1px solid ${T.border}`,
          borderRadius: 10, padding: "10px 12px", color: T.text, outline: "none",
        }}
      />
    </label>
  );
}
