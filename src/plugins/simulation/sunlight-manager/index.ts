import { Point } from '/src/plugins/core/canvas-events';
import RenderWindow from '/src/plugins/core/render-window';

const GRID_SIZE = 20;
const SUNLIGHT_COLOR = '#ffeb3b5a';

export default class SunlightManager {
  public sunlight = [
    { x: 10, y: 10, radius: 3 },
    { x: 20, y: 14, radius: 2 },
  ];

  constructor (private window: RenderWindow) {
    this.window.onRender.on(this.render);
  }

  private render = (context: CanvasRenderingContext2D) => {
    context.fillStyle = SUNLIGHT_COLOR;

    let dots = [] as Point[];

    this.sunlight.forEach(({ x, y, radius }) => {
      for (let i = 0; i < radius; ++i) {
        for (let j = 0; j < radius; ++j) {
          if (Math.sqrt(i * i + j * j) * 1.08 < radius) {
            dots.push({ x: x + i, y: y + j })
            dots.push({ x: x - i, y: y + j })
            dots.push({ x: x - i, y: y - j })
            dots.push({ x: x + i, y: y - j })
          }
        }
      }
    });

    dots = dots.filter((d, $i) => $i === dots.findIndex(($d) => d.x === $d.x && d.y === $d.y));

    dots.forEach(({ x, y }) => {
      context.beginPath();
      context.rect((x) * GRID_SIZE, (y) * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      context.fill();
    })
  };
};
