export type MatchResult = "W" | "D" | "L";

const resultStylesConfig = {
  W: { text: "W", title: "Wygrana", bg: "bg-green-500 dark:bg-green-500/80" },
  D: { text: "D", title: "Remis", bg: "bg-amber-300 dark:bg-amber-400/80" },
  L: { text: "L", title: "Porażka", bg: "bg-red-500 dark:bg-red-500/80" },
};

const sizeStyles = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-xl",
};

// albo gotowy wynik (forma w tabeli), albo bramki do przeliczenia
type ResultBadgeProps = { size?: keyof typeof sizeStyles } & (
  | { result: MatchResult }
  | { goalsFor: number; goalsAgainst: number }
);

function getResult(props: ResultBadgeProps): MatchResult {
  if ("result" in props) return props.result;
  if (props.goalsFor === props.goalsAgainst) return "D";
  return props.goalsFor > props.goalsAgainst ? "W" : "L";
}

const ResultBadge = (props: ResultBadgeProps) => {
  const size = props.size ?? "md";
  const config = resultStylesConfig[getResult(props)];

  return (
    <span
      title={config.title}
      className={`flex shrink-0 items-center justify-center rounded-md font-bold text-white ${sizeStyles[size]} ${config.bg}`}
    >
      {config.text}
    </span>
  );
};

export default ResultBadge;
