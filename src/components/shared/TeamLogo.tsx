interface TeamLogoProps {
  name: string | undefined,
  short_name: string | undefined
}

const TeamLogo = ({name, short_name}: TeamLogoProps) => {
  return (
    <div
      role="img"
      aria-label={name}
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-secondary/20"
    >
      <span className="text-xl font-extrabold tracking-wide text-foreground">
        {short_name}
      </span>
    </div>
  )
}

export default TeamLogo
