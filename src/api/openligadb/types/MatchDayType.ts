import { Static, Type } from '@sinclair/typebox';
import { MatchDataType } from './MatchDataType';

export const MatchDaySchema = Type.Array(MatchDataType);
export type MatchDayType = Static<typeof MatchDaySchema>;
