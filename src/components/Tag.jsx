import { NIVEL_BADGE } from "../constants/prompt";

export default function Tag({ nivel, label, className }) {
  const cls = className || NIVEL_BADGE[nivel] || "badge-blue";
  return <span className={`badge ${cls}`}>{label ?? nivel}</span>;
}
