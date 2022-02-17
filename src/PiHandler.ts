import { FormBuilder } from '@rweich/streamdeck-formbuilder';
import PropertyInspector from '@rweich/streamdeck-ts/dist/PropertyInspector';
import { Logger } from 'ts-log';
import { is } from 'ts-type-guards';

import ApiRegistry from './api/ApiRegistry';
import { FormSettingsType, PluginSettingsType } from './SettingsType';

export default class PiHandler {
  private readonly pi: PropertyInspector;
  private readonly settings: PluginSettingsType;
  private readonly apiRegistry: ApiRegistry;
  private readonly logger: Logger;
  private readonly apiFormContainer: HTMLElement;
  private readonly formBuilder: FormBuilder<FormSettingsType>;

  constructor(pi: PropertyInspector, settings: PluginSettingsType, apiRegistry: ApiRegistry, logger: Logger) {
    this.pi = pi;
    this.settings = settings;
    this.apiRegistry = apiRegistry;
    this.logger = logger;
    this.apiFormContainer = PiHandler.createFormContainer();
    this.formBuilder = new FormBuilder(settings);

    const apiSelector = this.formBuilder.createDropdown().setLabel('Match-Api');
    for (const factory of this.apiRegistry.getFactories()) {
      apiSelector.addOption(factory.apiName, factory.apiKey);
    }
    this.formBuilder.addElement('apiKey', apiSelector);
    this.formBuilder.on('change-settings', () => {
      const formData = this.formBuilder.getFormData();
      Array.from(this.apiFormContainer.children, (c) => c.remove());
      this.logger.info('got changesettings event', formData);
      this.updateApiSettings();
    });
  }

  private static createFormContainer(): HTMLElement {
    const header = document.createElement('div');
    header.classList.add('sdpi-heading');

    const inner = document.createElement('div');
    inner.classList.add('sdpi-item-group');

    const container = document.createElement('div');
    container.classList.add('sdpi-item');
    container.setAttribute('type', 'group');
    container.append(header);
    container.append(inner);

    return container;
  }

  public appendForm(element: HTMLElement): void {
    this.formBuilder.appendTo(element);
    element.append(this.apiFormContainer);
    this.updateApiSettings();
  }

  private updateApiSettings(): void {
    const formData = this.formBuilder.getFormData();
    this.logger.info('switchApiSettings called', formData);
    const factory = this.apiRegistry.getFactory(formData.apiKey);

    const header = this.apiFormContainer.querySelector('.sdpi-heading');
    if (header) {
      header.textContent = `${factory.apiName}-Settings`;
    }
    const inner = this.apiFormContainer.querySelector('.sdpi-item-group');
    if (!is(HTMLElement)(inner)) {
      return;
    }

    const sf = factory.settingsForm(this.settings.payload);
    sf.onChangeSettings((formData) => {
      this.sendSettings(factory.apiKey, formData);
    });
    sf.appendSettingsTo(inner);
  }

  private sendSettings(apiKey: string, payload: unknown): void {
    this.logger.info('sending settings', apiKey, payload);
    if (this.pi.pluginUUID === undefined) {
      this.logger.error('pi has no context or action!', this.pi.pluginUUID, this.pi.info);
      return;
    }
    this.pi.setSettings(this.pi.pluginUUID, { apiKey, payload });
  }
}
