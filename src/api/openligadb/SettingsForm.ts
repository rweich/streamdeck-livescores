import { FormBuilder } from '@rweich/streamdeck-formbuilder';

import assertType from '../../AssertType';
import SettingsFormInterface from '../SettingsFormInterface';
import { SettingsLeagueEnum, SettingsSchema, SettingsType, SettingsTypeEnum } from './types/SettingsType';

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
        type: SettingsTypeEnum.MATCH_DAY,
      };
    }
    this.formBuilder = this.createFormBuilder(this.settings);
  }

  public onChangeSettings(callback: (formData: unknown) => void): void {
    this.formBuilder.on('change-settings', () => callback(this.formBuilder.getFormData()));
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
        .addOption('Euro 2020', SettingsLeagueEnum.EURO_2020)
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
        .addOption('10', '10')
        .addOption('11', '11')
        .addOption('12', '12')
        .showOn(() => builder.getFormData().type === SettingsTypeEnum.MATCH_DAY),
    );
    return builder;
  }
}
