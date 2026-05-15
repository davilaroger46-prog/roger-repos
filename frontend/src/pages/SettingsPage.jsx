import { T } from "../constants/theme";

export default function SettingsPage() {
  return (
    <div style={{
      background: T.s1, border: `1px solid ${T.border}`,
      borderRadius: 18, padding: 32, textAlign: "center",
    }}>
      <h2 style={{ color: T.text, fontSize: 16, fontWeight: 800, margin: "0 0 8px" }}>
        Configurações
      </h2>
      <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>Em breve.</p>
    </div>
  );
}
