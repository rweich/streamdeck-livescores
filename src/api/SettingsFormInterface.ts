export default interface SettingsFormInterface {
  onChangeSettings(callback: (formData: unknown) => void): void;
  appendSettingsTo(element: HTMLElement): void;
}
