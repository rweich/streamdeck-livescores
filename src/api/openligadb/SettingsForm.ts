import { SettingsLeagueEnum, SettingsSchema, SettingsType, SettingsTypeEnum } from './types/SettingsType';

import { EventsEnum } from '../../formbuilder/EventsEnum';
import FormBuilder from '../../formbuilder/FormBuilder';
import SettingsFormInterface from '../SettingsFormInterface';
import assertType from '../../AssertType';

export default class SettingsForm implements SettingsFormInterface {
  private readonly settings: SettingsType;
  private readonly formBuilder: FormBuilder<SettingsType>;

  constructor(settings: unknown) {
    try {
      assertType(SettingsSchema, settings);
      this.settings = settings;
    } catch {
      this.settings = {
        league: SettingsLeagueEnum.BUNDESLIGA,
        matchId: '',
        matchOfLeague: '1',
        type: SettingsTypeEnum.SINGLE_MATCH,
      };
    }
    this.formBuilder = this.createFormBuilder(this.settings);
  }

  public onChangeSettings(callback: (formData: unknown) => void): void {
    this.formBuilder.on(EventsEnum.CHANGE_SETTINGS, () => callback(this.formBuilder.getFormData()));
  }

  public appendSettingsTo(element: HTMLElement): void {
    this.formBuilder.appendTo(element);
  }

  private createFormBuilder(settings: SettingsType): FormBuilder<SettingsType> {
    const builder = new FormBuilder(settings);
    builder.addElement(
      'type',
      builder
        .createDropdown()
        .setLabel('Type')
        .addOption('Single Match', SettingsTypeEnum.SINGLE_MATCH)
        .addOption('Match day', SettingsTypeEnum.MATCH_DAY),
    );
    builder.addElement(
      'matchId',
      builder
        .createInput()
        .setLabel('Match-Id')
        .setPlaceholder('eg. 58784')
        .showOn(() => builder.getFormData().type === SettingsTypeEnum.SINGLE_MATCH),
    );
    builder.addElement(
      'league',
      builder
        .createDropdown()
        .setLabel('League')
        .addOption('Bundesliga', SettingsLeagueEnum.BUNDESLIGA)
        .addOption('2. Bundesliga', SettingsLeagueEnum.BUNDESLIGA_2)
        .showOn(() => builder.getFormData().type === SettingsTypeEnum.MATCH_DAY),
    );
    builder.addElement(
      'matchOfLeague',
      builder
        .createDropdown()
        .setLabel('Match Number')
        .addOption('1', '1')
        .addOption('2', '2')
        .addOption('3', '3')
        .addOption('4', '4')
        .addOption('5', '5')
        .addOption('6', '6')
        .addOption('7', '7')
        .addOption('8', '8')
        .addOption('9', '9')
        .showOn(() => builder.getFormData().type === SettingsTypeEnum.MATCH_DAY),
    );
    return builder;
  }
}
