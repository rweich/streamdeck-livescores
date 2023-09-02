import { Static, Type } from '@sinclair/typebox';

/** @see https://api.openligadb.de/ */

/* eslint-disable sort-keys */
export const MatchDataType = Type.Object({
  matchID: Type.Number(),
  matchDateTime: Type.String(),
  timeZoneID: Type.String(),
  leagueId: Type.Number(),
  leagueName: Type.String(),
  matchDateTimeUTC: Type.String(),
  group: Type.Object({
    groupName: Type.String(),
    groupOrderID: Type.Number(),
    groupID: Type.Number(),
  }),
  team1: Type.Object({
    teamId: Type.Number(),
    teamName: Type.String(),
    shortName: Type.String(),
    teamIconUrl: Type.String(),
    teamGroupName: Type.Any(),
  }),
  team2: Type.Object({
    teamId: Type.Number(),
    teamName: Type.String(),
    shortName: Type.String(),
    teamIconUrl: Type.String(),
    teamGroupName: Type.Any(),
  }),
  lastUpdateDateTime: Type.Union([Type.String(), Type.Null()]),
  matchIsFinished: Type.Boolean(),
  matchResults: Type.Array(
    Type.Object({
      resultID: Type.Number(),
      resultName: Type.String(),
      pointsTeam1: Type.Number(),
      pointsTeam2: Type.Number(),
      resultOrderID: Type.Number(),
      resultTypeID: Type.Number(),
      resultDescription: Type.Union([Type.String(), Type.Null()]),
    }),
  ),
  goals: Type.Array(
    Type.Object({
      goalID: Type.Number(),
      scoreTeam1: Type.Number(),
      scoreTeam2: Type.Number(),
      matchMinute: Type.Union([Type.Number(), Type.Null()]),
      goalGetterID: Type.Number(),
      goalGetterName: Type.String(),
      isPenalty: Type.Boolean(),
      isOwnGoal: Type.Boolean(),
      isOvertime: Type.Boolean(),
      comment: Type.Union([Type.Null(), Type.String()]),
    }),
  ),
  location: Type.Any(),
  numberOfViewers: Type.Any(),
});
/* eslint-enable sort-keys */

export type MatchDataInterface = Static<typeof MatchDataType>;
