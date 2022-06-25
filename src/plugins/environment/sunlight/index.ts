import RenderWindow from '/src/plugins/core/render-window';
import SimulationTicks from '/src/plugins/core/simulation-ticks';
import CellsManager from '/src/plugins/simulation/cells-manager';
import MutationsManager from '/src/plugins/simulation/mutations-manager';

import Food from '/src/plugins/environment/food';

import { Point } from '/src/libs/utils';

export type Spot = Point & { r: number };

const GRID_SIZE = 20;
const SUNLIGHT_COLOR = '#ffeb3b5a';
const SUN_TO_HAVE = 1000;

export default class Sunlight {
  private idgen = 10;
  public spots = new Map<number, Spot>();

  public spawn = (spot: Spot) => { const id = this.idgen++; this.spots.set(id, spot); return id; };
  public despawn = (id: number) => this.spots.delete(id);
  public update = (id: number, u: (spot: Spot) => Spot) => { const spot = this.spots.get(id); if (spot) this.spots.set(id, u(spot)); };
  public get = (id: number) => this.spots.get(id);

  public dots = [] as Point[];

  public updateDots = () => {
    let dots = [] as Point[];

    for (let [id, { x, y, r }] of this.spots.entries()) {
      for (let i = 0; i < r; ++i) {
        for (let j = 0; j < r; ++j) {
          if (Math.sqrt(i * i + j * j) * 1.08 < r) {
            dots.push({ x: x + i, y: y + j })
            dots.push({ x: x - i, y: y + j })
            dots.push({ x: x - i, y: y - j })
            dots.push({ x: x + i, y: y - j })
          }
        }
      }
    }

    this.dots = dots.filter((d, $i) => $i === dots.findIndex(($d) => d.x === $d.x && d.y === $d.y));
  };

  constructor (private window: RenderWindow, private ticks: SimulationTicks, private food: Food, private cells: CellsManager, private mutations: MutationsManager) {
    // Now we render the sunlight
    this.window.onRender.on((context: CanvasRenderingContext2D) => {
      context.fillStyle = SUNLIGHT_COLOR;

      this.dots.forEach(({ x, y }) => {
        context.beginPath();
        context.rect((x) * GRID_SIZE, (y) * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        context.fill();
      })
    });

    // Now we want to support some level of sun all over the game board
    this.ticks.add({ color: SUNLIGHT_COLOR.substr(0, 7), interval: 1500 }, () => {
      const sunWeHave = this.dots.length;

      if (sunWeHave < SUN_TO_HAVE) {
        this.spawn({
          x: Math.floor(Math.random() * 100 - 50),
          y: Math.floor(Math.random() * 100 - 50),
          r: 10,
        });
      }

      for (let id of this.spots.keys()) {
        if (Math.random() > .5) {
          this.update(id, ($) => ({
            ...$,
            x: $.x + Math.floor(Math.random() * 4 - 2),
            y: $.y + Math.floor(Math.random() * 4 - 2),
            r: $.r + Math.floor(Math.random() * 2 - 1),
          }))
        }
      }

      for (let id of this.spots.keys()) {
        const spot = this.get(id);

        if (spot && spot.r < 1) {
          this.despawn(id);
        }
      }

      this.updateDots();
    });

    // Spawn food in sunlight
    this.ticks.add({ interval: 200, color: 'green' }, () => {
      const dots = this.dots;
      const p = dots[Math.floor(Math.random() * dots.length)];

      p && this.food.spawn(p, 10);
    });

    // Let the mutations to get vision
    this.mutations.onCollectClues.on(() => {
      return [
        { type: 'see', what: 'sun', where: 'up' },
        { type: 'see', what: 'sun', where: 'down' },
        { type: 'see', what: 'sun', where: 'right' },
        { type: 'see', what: 'sun', where: 'left' },
      ];
    });

    this.cells.onCollectClues.on((id: number) => {
      const cell = this.cells.get(id) as any;
      const dots = this.dots;

      return ([
        [{ x: cell.x, y: cell.y - 1 }, 'up'],
        [{ x: cell.x, y: cell.y + 1 }, 'down'],
        [{ x: cell.x - 1, y: cell.y }, 'left'],
        [{ x: cell.x + 1, y: cell.y }, 'right'],
      ] as const).map(([p, d]) => {
        if (dots.find(($d) => $d.x === p.x && $d.y === p.y)) {
          return d;
        } else {
          return null;
        }
      }).filter(Boolean).map((d) => ({ type: 'see', what: 'sun', where: d }));
    });
  }
};
