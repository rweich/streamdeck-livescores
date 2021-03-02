export default class ImageLoader {
  private iconCache: Record<string, HTMLImageElement | null> = {};

  public loadImage(url: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      if (this.iconCache[url] !== undefined) {
        resolve(this.iconCache[url]);
        return;
      }
      const image = new Image();
      image.onload = () => {
        this.iconCache[url] = image;
        resolve(image);
      };
      image.onerror = () => {
        this.iconCache[url] = null;
        resolve(null);
      };
      image.src = url;
    });
  }
}
