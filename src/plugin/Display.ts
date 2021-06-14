import ContextData from './ContextData';
import ImageLoader from './ImageLoader';
import { Logger } from 'ts-log';
import { Plugin } from '@rweich/streamdeck-ts';
import ScoreInterface from '../api/ScoreInterface';
import dayjs from 'dayjs';

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
    const context = canvas.getContext('2d');
    if (!context) {
      return new Image();
    }
    // circle
    context.beginPath();
    context.arc(20, 20, 19, 0, Math.PI * 2, true);
    context.strokeStyle = 'white';
    context.fillStyle = 'white';
    team === 'A' ? context.stroke() : context.fill();
    // text
    context.font = '24px sans-serif';
    context.textAlign = 'center';
    context.fillStyle = team === 'A' ? 'white' : 'black';
    context.fillText(team, 20, 29);

    const image = new Image();
    image.src = canvas.toDataURL('image/png');
    return image;
  }

  public displayMatch(data: ScoreInterface, contextData: ContextData): void {
    this.logger.info('displayMatch', contextData.context, data);

    this.logger.debug('creating image');
    const canvas = Display.createCanvas(144, 144);
    const context = canvas.getContext('2d');
    if (context === null) {
      throw new Error('could not create 2d context in canvas');
    }

    this.addScore(data, context);
    let promise;

    if (contextData.shouldShowIcon()) {
      promise = Promise.all([
        this.loadImageOrDefault(data.team1.iconUrl, 'A'),
        this.loadImageOrDefault(data.team2.iconUrl, 'B'),
      ]).then((images) => {
        if (images.length !== 2) {
          this.logger.error('wrong number of images', images);
          throw new Error('wrong number of images');
        }

        context.drawImage(images[0], 20, 20, 40, 40);
        context.drawImage(images[1], 84, 20, 40, 40);
        return true;
      });
    } else {
      this.addShortName(data, context);
      promise = Promise.resolve();
    }

    promise
      .finally(() => {
        this.plugin.setImage(canvas.toDataURL('image/png'), contextData.context);
      })
      .catch((error) => this.logger.error(error));
  }

  private loadImageOrDefault(url: string, team: string): Promise<HTMLImageElement> {
    return this.imageLoader.loadImage(url).then((imageOrUndef) => {
      if (imageOrUndef === undefined) {
        return Display.createDefaultImage(team);
      }
      return imageOrUndef;
    });
  }

  private addScore(data: ScoreInterface, context: CanvasRenderingContext2D): void {
    this.logger.debug('addScore');
    if (data.matchIs.notStarted) {
      const date = dayjs(data.startDate);
      context.font = '24px sans-serif';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.fillText(date.format('DD.MM.'), 72, 100, 144);
      context.fillText(date.format('HH:mm'), 72, 125, 144);
      return;
    }

    context.fillStyle = 'white';
    context.font = '40px sans-serif';
    context.textAlign = 'center';
    if (data.matchIs.running) {
      context.fillStyle = '#f76363';
    }
    context.fillText(data.team1.points + ' : ' + data.team2.points, 72, 120, 144);
  }

  private addShortName(data: ScoreInterface, context: CanvasRenderingContext2D): void {
    this.logger.debug('addShortName');
    context.fillStyle = 'white';
    context.font = '24px sans-serif';
    context.textAlign = 'center';
    context.fillText(data.team1.shortName + ' - ' + data.team2.shortName, 72, 50, 144);
  }
}
