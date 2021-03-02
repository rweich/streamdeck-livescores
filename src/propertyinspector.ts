import { assertType, GetSettingsEvent, IncomingEvents, SetSettingsEvent, Streamdeck } from '@rweich/streamdeck-ts';
import { is } from 'ts-type-guards';
import { SettingsType } from './SettingsType';

const pi = new Streamdeck().propertyinspector();
const defaultMatchId = '58784';

const getInput = (name: string): HTMLInputElement | null => {
  const input = document.querySelector("input[name='" + name + "']");
  if (is(HTMLInputElement)(input)) {
    return input;
  }
  return null;
};
const getInputVal = (name: string): string | null => {
  const input = getInput(name);
  return input ? input.value : null;
};
const setInputVal = (name: string, value: string): void => {
  const input = getInput(name);
  if (input) {
    input.value = value;
  }
};
const onInput = (event: Event): void => {
  console.log('item changed', event.target, 'event:', event);
  if (pi.context === null) {
    console.error('pi has no context or action!', pi.context, pi.action);
    return;
  }
  if (!is(HTMLInputElement)(event.target)) {
    return;
  }
  pi.sendEvent(
    new SetSettingsEvent(pi.context, {
      matchId: getInputVal('matchId') || defaultMatchId,
    }),
  );
};

pi.on(IncomingEvents.OnWebsocketOpen, (event) => {
  pi.sendEvent(new GetSettingsEvent(event.uuid));
  Array.from(document.querySelectorAll('.sdpi-item-value')).forEach((input) => {
    if (is(HTMLInputElement)(input)) {
      input.addEventListener('input', onInput);
    }
  });
});
pi.on(IncomingEvents.DidReceiveSettings, (event) => {
  try {
    assertType(SettingsType, event.settings);
    setInputVal('matchId', event.settings.matchId || defaultMatchId);
  } catch (e) {
    setInputVal('matchId', defaultMatchId);
  }
});

export default pi;
