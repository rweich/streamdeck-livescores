import { Static, Type } from '@sinclair/typebox';

export const PluginSettingsSchema = Type.Object({
  apiKey: Type.String(),
  payload: Type.Optional(Type.Any()),
});
export type PluginSettingsType = Static<typeof PluginSettingsSchema>;

export type FormSettingsType = {
  apiKey: string;
};
