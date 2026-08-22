type MatchResult = "W" | "D" | "L";

const resultStylesConfig = {
  W: { text: "W", title: "Wygrana", bg: "bg-green-500 dark:bg-green-500/80" },
  D: { text: "D", title: "Remis", bg: "bg-amber-300 dark:bg-amber-400/80" },
  L: { text: "L", title: "Porażka", bg: "bg-red-500 dark:bg-red-500/80" },
};

const sizeStyles = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-xl",
};

interface ResultBadgeProps {
  goalsFor: number;
  goalsAgainst: number;
  size?: keyof typeof sizeStyles;
}

const ResultBadge = ({
  goalsFor,
  goalsAgainst,
  size = "md",
}: ResultBadgeProps) => {
  let result: MatchResult;
  if (goalsFor === goalsAgainst) {
    result = "D";
  } else if (goalsFor > goalsAgainst) {
    result = "W";
  } else {
    result = "L";
  }

  const config = resultStylesConfig[result];

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
