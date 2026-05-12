import { T } from "../constants/theme";

const MAP = {
  draft: ["Rascunho", T.muted],
  review_pending: ["Em revisão", T.amber],
  approved: ["Aprovado", T.green],
  rejected: ["Rejeitado", T.red],
};

export default function ReviewBadge({ status }) {
  const [label, color] = MAP[status] || ["Sem status", T.muted];

  return (
    <span style={{
      fontSize: 10,
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: ".08em",
      color,
      background: `${color}12`,
      border: `1px solid ${color}35`,
      borderRadius: 999,
      padding: "4px 9px",
    }}>
      {label}
    </span>
  );
}
