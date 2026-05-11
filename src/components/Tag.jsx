import { NIVEL_BADGE } from "../constants/prompt";

export default function Tag({ nivel, label, className, c, sm, children }) {
  // color prop style (new interface)
  if (c) {
    return (
      <span style={{
        display: "inline-block",
        padding: sm ? "2px 7px" : "3px 10px",
        borderRadius: 999,
        fontSize: sm ? 10 : 11,
        fontWeight: 700,
        background: `${c}22`,
        color: c,
        border: `1px solid ${c}44`,
        lineHeight: 1.4,
      }}>
        {children}
      </span>
    );
  }

  // className / nivel interface (legacy)
  const cls = className || NIVEL_BADGE[nivel] || "badge-blue";
  return <span className={`badge ${cls}`}>{children ?? label ?? nivel}</span>;
}
