export default class ImageLoader {
  private iconCache: Record<string, HTMLImageElement | undefined> = {};

  public loadImage(url: string): Promise<HTMLImageElement | undefined> {
    return new Promise((resolve) => {
      if (this.iconCache[url] !== undefined) {
        resolve(this.iconCache[url]);
        return;
      }
      const image = new Image();
      image.addEventListener('load', () => {
        this.iconCache[url] = image;
        resolve(image);
      });
      image.addEventListener('error', () => {
        this.iconCache[url] = undefined;
        // eslint-disable-next-line unicorn/no-useless-undefined
        resolve(undefined);
      });
      image.src = url;
    });
  }
}
