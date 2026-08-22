// Konfiguracja wierszy statystyk dla MatchStats — co pokazujemy, w jakiej
// kolejności i w jakich sekcjach. Same dane, zero JSX.
//
// Leży obok komponentu, a nie w lib/, bo opiera się na typach propsów wierszy
// (NumberRowProps / ParsedRowProps). lib/ jest warstwą, od której zależą
// komponenty — nie odwrotnie.

import type { Match } from "@/data/types";

import type { NumberRowProps } from "./StatRow";
import type { ParsedRowProps } from "./ParsedStatRow";

export type Row =
  | ({ kind: "number" } & NumberRowProps)
  | ({ kind: "parsed" } & ParsedRowProps);

export type StatGroup = {
  title: string;
  rows: Row[];
};

/** Sekcja widoczna zawsze — najważniejsze statystyki meczu. */
export function getTopGroup(match: Match): StatGroup {
  return {
    title: "Top statystyki",
    rows: [
      { kind: "number", label: "Oczekiwane gole (xG)", home: match.home_expected_goals_xg, away: match.away_expected_goals_xg, decimals: 2 },
      { kind: "number", label: "Posiadanie piłki", home: match.home_ball_possession, away: match.away_ball_possession, suffix: "%" },
      { kind: "parsed", label: "Podania", home: match.home_passes, away: match.away_passes },
      { kind: "number", label: "Strzały łącznie", home: match.home_total_shots, away: match.away_total_shots },
      { kind: "number", label: "Strzały celne", home: match.home_shots_on_target, away: match.away_shots_on_target },
      { kind: "number", label: "Rzuty rożne", home: match.home_corner_kicks, away: match.away_corner_kicks },
      { kind: "number", label: "Faule", home: match.home_fouls, away: match.away_fouls },
      { kind: "number", label: "Żółte kartki", home: match.home_yellow_cards, away: match.away_yellow_cards },
    ],
  };
}

/**
 * Pełny rozkład statystyk na sekcje, pokazywany po rozwinięciu.
 */
export function getAllGroups(match: Match): StatGroup[] {
  return [
    {
      title: "Atak",
      rows: [
        { kind: "number", label: "Oczekiwane gole (xG)", home: match.home_expected_goals_xg, away: match.away_expected_goals_xg, decimals: 2 },
        { kind: "number", label: "xG celnych strzałów (xGOT)", home: match.home_xg_on_target_xgot, away: match.away_xg_on_target_xgot, decimals: 2 },
        { kind: "number", label: "Oczekiwane asysty (xA)", home: match.home_expected_assists_xa, away: match.away_expected_assists_xa, decimals: 2 },
        { kind: "number", label: "Klarowne sytuacje", home: match.home_big_chances, away: match.away_big_chances },
        { kind: "number", label: "Strzały łącznie", home: match.home_total_shots, away: match.away_total_shots },
        { kind: "number", label: "Strzały celne", home: match.home_shots_on_target, away: match.away_shots_on_target },
        { kind: "number", label: "Strzały niecelne", home: match.home_shots_off_target, away: match.away_shots_off_target },
        { kind: "number", label: "Strzały zablokowane", home: match.home_blocked_shots, away: match.away_blocked_shots },
        { kind: "number", label: "Strzały z pola karnego", home: match.home_shots_inside_the_box, away: match.away_shots_inside_the_box },
        { kind: "number", label: "Strzały spoza pola karnego", home: match.home_shots_outside_the_box, away: match.away_shots_outside_the_box },
        { kind: "number", label: "Trafienia w słupek", home: match.home_hit_the_woodwork, away: match.away_hit_the_woodwork },
        { kind: "number", label: "Rzuty rożne", home: match.home_corner_kicks, away: match.away_corner_kicks },
      ],
    },
    {
      title: "Posiadanie i podania",
      rows: [
        { kind: "number", label: "Posiadanie piłki", home: match.home_ball_possession, away: match.away_ball_possession, suffix: "%" },
        { kind: "parsed", label: "Podania", home: match.home_passes, away: match.away_passes },
        { kind: "parsed", label: "Długie podania", home: match.home_long_passes, away: match.away_long_passes },
        { kind: "parsed", label: "Podania na ostatniej tercji", home: match.home_passes_in_final_third, away: match.away_passes_in_final_third },
        { kind: "parsed", label: "Dośrodkowania", home: match.home_crosses, away: match.away_crosses },
        { kind: "number", label: "Podania prostopadłe", home: match.home_accurate_through_passes, away: match.away_accurate_through_passes },
        { kind: "number", label: "Kontakty w polu karnym rywala", home: match.home_touches_in_opposition_box, away: match.away_touches_in_opposition_box },
      ],
    },
    {
      title: "Obrona",
      rows: [
        { kind: "parsed", label: "Odbiory", home: match.home_tackles, away: match.away_tackles },
        { kind: "number", label: "Wygrane pojedynki", home: match.home_duels_won, away: match.away_duels_won },
        { kind: "number", label: "Przechwyty", home: match.home_interceptions, away: match.away_interceptions },
        { kind: "number", label: "Wybicia", home: match.home_clearances, away: match.away_clearances },
        { kind: "number", label: "Obrony bramkarza", home: match.home_goalkeeper_saves, away: match.away_goalkeeper_saves },
        { kind: "number", label: "Błędy przy strzale", home: match.home_errors_leading_to_shot, away: match.away_errors_leading_to_shot },
        { kind: "number", label: "Błędy przy golu", home: match.home_errors_leading_to_goal, away: match.away_errors_leading_to_goal },
      ],
    },
    {
      title: "Dyscyplina",
      rows: [
        { kind: "number", label: "Faule", home: match.home_fouls, away: match.away_fouls },
        { kind: "number", label: "Żółte kartki", home: match.home_yellow_cards, away: match.away_yellow_cards },
        { kind: "number", label: "Czerwone kartki", home: match.home_red_cards, away: match.away_red_cards },
        { kind: "number", label: "Spalone", home: match.home_offsides, away: match.away_offsides },
        { kind: "number", label: "Rzuty wolne", home: match.home_free_kicks, away: match.away_free_kicks },
        { kind: "number", label: "Wrzuty", home: match.home_throw_ins, away: match.away_throw_ins },
      ],
    },
  ];
}
