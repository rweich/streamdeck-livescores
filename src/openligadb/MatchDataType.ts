import { Static, Type } from '@sinclair/typebox';

export const MatchDataType = Type.Object({
  MatchID: Type.Number(),
  MatchDateTime: Type.String(),
  TimeZoneID: Type.String(),
  LeagueId: Type.Number(),
  LeagueName: Type.String(),
  MatchDateTimeUTC: Type.String(),
  Group: Type.Object({
    GroupName: Type.String(),
    GroupOrderID: Type.Number(),
    GroupID: Type.Number(),
  }),
  Team1: Type.Object({
    TeamId: Type.Number(),
    TeamName: Type.String(),
    ShortName: Type.String(),
    TeamIconUrl: Type.String(),
    TeamGroupName: Type.Any(),
  }),
  Team2: Type.Object({
    TeamId: Type.Number(),
    TeamName: Type.String(),
    ShortName: Type.String(),
    TeamIconUrl: Type.String(),
    TeamGroupName: Type.Any(),
  }),
  LastUpdateDateTime: Type.String(),
  MatchIsFinished: Type.Boolean(),
  MatchResults: Type.Array(
    Type.Object({
      ResultID: Type.Number(),
      ResultName: Type.String(),
      PointsTeam1: Type.Number(),
      PointsTeam2: Type.Number(),
      ResultOrderID: Type.Number(),
      ResultTypeID: Type.Number(),
      ResultDescription: Type.String(),
    }),
  ),
  Goals: Type.Array(
    Type.Object({
      GoalID: Type.Number(),
      ScoreTeam1: Type.Number(),
      ScoreTeam2: Type.Number(),
      MatchMinute: Type.Union([Type.Number(), Type.Null()]),
      GoalGetterID: Type.Number(),
      GoalGetterName: Type.String(),
      IsPenalty: Type.Boolean(),
      IsOwnGoal: Type.Boolean(),
      IsOvertime: Type.Boolean(),
      Comment: Type.Union([Type.Null(), Type.String()]),
    }),
  ),
  Location: Type.Any(),
  NumberOfViewers: Type.Any(),
});

export type MatchDataInterface = Static<typeof MatchDataType>;
