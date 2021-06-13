import { Type } from '@sinclair/typebox';

export enum SettingsTypeEnum {
  SINGLE_MATCH = 'singlematch',
  MATCH_DAY = 'matchday',
}

export enum SettingsLeagueEnum {
  BUNDESLIGA = 'bl1',
  BUNDESLIGA_2 = 'bl2',
  EURO_2020 = 'em20',
}

export const SettingsSchema = Type.Object({
  league: Type.Enum(SettingsLeagueEnum),
  matchId: Type.String(),
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
    Type.Literal('10'),
    Type.Literal('11'),
    Type.Literal('12'),
  ]),
  type: Type.Enum(SettingsTypeEnum),
});

export type SettingsType = {
  type: SettingsTypeEnum;
  matchId: string;
  league: SettingsLeagueEnum;
  matchOfLeague: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
};
