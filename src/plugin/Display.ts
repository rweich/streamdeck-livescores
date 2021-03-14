import { Plugin, SetImageEvent } from '@rweich/streamdeck-ts';
import dayjs from 'dayjs';
import { Logger } from 'ts-log';
import ScoreInterface from '../api/ScoreInterface';
import ImageLoader from './ImageLoader';

export default class Display {
  private readonly plugin: Plugin;
  private readonly imageLoader: ImageLoader;
  private readonly logger: Logger;

  constructor(plugin: Plugin, imageLoader: ImageLoader, logger: Logger) {
    this.plugin = plugin;
    this.imageLoader = imageLoader;
    this.logger = logger;
  }

  private static createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  /**
   * Creates the default image with the passed char (basically a circle with A or B in it)
   */
  private static createDefaultImage(team = 'A'): HTMLImageElement {
    const canvas = Display.createCanvas(40, 40);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return new Image();
    }
    // circle
    ctx.beginPath();
    ctx.arc(20, 20, 19, 0, Math.PI * 2, true);
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    team === 'A' ? ctx.stroke() : ctx.fill();
    // text
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = team === 'A' ? 'white' : 'black';
    ctx.fillText(team, 20, 29);

    const image = new Image();
    image.src = canvas.toDataURL('image/png');
    return image;
  }

  public displayMatch(data: ScoreInterface, context: string): void {
    this.logger.info('displayMatch', context, data);
    Promise.all([this.loadImageOrDefault(data.team1.iconUrl, 'A'), this.loadImageOrDefault(data.team2.iconUrl, 'B')])
      .then((images) => {
        if (images.length !== 2) {
          this.logger.error('wrong number of images', images);
          return;
        }
        this.logger.debug('creating image');
        const canvas = Display.createCanvas(144, 144);
        const ctx = canvas.getContext('2d');
        if (ctx === null) {
          return;
        }

        ctx.drawImage(images[0], 20, 20, 40, 40);
        ctx.drawImage(images[1], 84, 20, 40, 40);
        this.addText(data, ctx);

        this.plugin.sendEvent(new SetImageEvent(canvas.toDataURL('image/png'), context));
      })
      .catch((error) => this.logger.error(error));
  }

  private loadImageOrDefault(url: string, team: string): Promise<HTMLImageElement> {
    return this.imageLoader.loadImage(url).then((imageOrNull) => {
      if (imageOrNull === null) {
        return Display.createDefaultImage(team);
      }
      return imageOrNull;
    });
  }

  private addText(data: ScoreInterface, ctx: CanvasRenderingContext2D): void {
    this.logger.debug('addText');
    if (data.matchIs.notStarted) {
      const date = dayjs(data.startDate);
      ctx.font = '24px sans-serif';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(date.format('DD.MM.'), 72, 100, 144);
      ctx.fillText(date.format('HH:mm'), 72, 125, 144);
      return;
    }

    ctx.fillStyle = 'white';
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    if (data.matchIs.running) {
      ctx.fillStyle = '#f76363';
    }
    ctx.fillText(data.team1.points + ' : ' + data.team2.points, 72, 120, 144);
  }
}
