interface TeamInterface {
  name: string;
  iconUrl: string;
  points: number;
}

export type MatchIsType = {
  notStarted: boolean;
  running: boolean;
  finished: boolean;
};

export default interface ScoreInterface {
  team1: TeamInterface;
  team2: TeamInterface;
  startDate: Date;
  matchIs: MatchIsType;
  updateIntervalSeconds?: number;
  updateAt?: Date;
}
