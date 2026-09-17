import { weatherScoreColor } from "@/lib/weatherConfig";

interface WeatherScoreRingProps {
  score: number;
  size?: "md" | "lg";
}

const RADIUS = 42;
const STROKE = 7;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const sizeClasses = {
  md: { ring: "size-32", number: "text-4xl" },
  lg: { ring: "size-40 xl:size-48", number: "text-4xl xl:text-5xl" },
};

const WeatherScoreRing = ({ score, size = "md" }: WeatherScoreRingProps) => {
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div className={`relative ${sizeClasses[size].ring}`}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-muted"
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={`stroke-current ${weatherScoreColor(score)} transition-[stroke-dashoffset] duration-500`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold tabular-nums ${sizeClasses[size].number}`}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
};

export default WeatherScoreRing;
