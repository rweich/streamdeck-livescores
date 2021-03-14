import { Type } from '@sinclair/typebox';

export enum SettingsTypeEnum {
  SINGLE_MATCH = 'singlematch',
  MATCH_DAY = 'matchday',
}

export enum SettingsLeagueEnum {
  BUNDESLIGA = 'bl1',
  BUNDESLIGA_2 = 'bl2',
}

export const SettingsSchema = Type.Object({
  type: Type.Enum(SettingsTypeEnum),
  matchId: Type.String(),
  league: Type.Enum(SettingsLeagueEnum),
  matchOfLeague: Type.Union([
    Type.Literal('1'),
    Type.Literal('2'),
    Type.Literal('3'),
    Type.Literal('4'),
    Type.Literal('5'),
    Type.Literal('6'),
    Type.Literal('7'),
    Type.Literal('8'),
    Type.Literal('9'),
  ]),
});

export type SettingsType = {
  type: SettingsTypeEnum;
  matchId: string;
  league: SettingsLeagueEnum;
  matchOfLeague: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
};
