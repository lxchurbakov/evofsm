import RenderWindow from '/src/plugins/core/render-window';
import SimulationTicks from '/src/plugins/core/simulation-ticks';

import CellsManager from '/src/plugins/simulation/cells-manager';
import MutationsManager from '/src/plugins/simulation/mutations-manager';

import { Point } from '/src/libs/utils';

export type Food = Point & { value: number };

const GRID_SIZE = 20;
const FOOD_COLOR = '#4caf50';

class JMap <K, V> {
  private map = new Map<string, V>();

  public get = (k: K) => this.map.get(JSON.stringify(k));
  public set = (k: K, v: V) => this.map.set(JSON.stringify(k), v);
  public delete = (k: K) => this.map.delete(JSON.stringify(k));

  public keys = function* () {
    for (let key of this.map.keys()) {
      yield JSON.parse(key) as K;
    }
  }
};

export default class FoodManager {
  public food = new JMap<Point, number>();
  public fullness = new Map<number, number>();

  public get = (p: Point) => this.food.get(p);
  public spawn = (p: Point, value: number) => this.food.set(p, value);
  public despawn = (p: Point) => this.food.delete(p);

  public getFullness = (id: number) => this.fullness.get(id);
  public setFullness = (id: number, value: number) => this.fullness.set(id, value);
  public removeFullness = (id: number) => this.fullness.delete(id);

  constructor (private renderWindow: RenderWindow, private mutations: MutationsManager, private cells: CellsManager, private ticks: SimulationTicks) {
    // First of all we render food
    this.renderWindow.onRender.on((context: CanvasRenderingContext2D) => {
      context.fillStyle = FOOD_COLOR;

      for (let { x, y } of this.food.keys()) {
        context.beginPath();
        context.rect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        context.fill();
      }
    });

    // If a cell steps on a food, the food gets eaten
    this.cells.onAfterAction.on((id: number) => {
      const cell = this.cells.get(id);
      const fullness = this.getFullness(id);

      if (cell && fullness) {
        const p = { x: cell.x, y: cell.y };
        const food = this.get(p);

        if (food) {
          this.setFullness(id, fullness + food);
          this.despawn(p);
        }
      }
    });

    // Here we add hunger to the cells and remove empty cells
    this.ticks.add({ interval: 1000, color: 'red' }, () => {
      for (let id of this.cells.ids()) {
        let fullness = this.getFullness(id);

        if (!fullness) {
          console.warn(`Fullness for ${id} was not set.`);
          fullness = 5;
        }

        if (fullness < 0) {
          this.cells.despawn(id);
          this.removeFullness(id);
        } else {
          this.setFullness(id, fullness - 1);
        }
      }
    });

    // Let the mutations to get vision
    this.mutations.onCollectClues.on(() => {
      return [
        { type: 'see', what: 'food', where: 'up' },
        { type: 'see', what: 'food', where: 'down' },
        { type: 'see', what: 'food', where: 'right' },
        { type: 'see', what: 'food', where: 'left' },
      ];
    });

    this.cells.onCollectClues.on((id: number) => {
      const cell = this.cells.get(id) as any;

      return [
        this.food.get({ x: cell.x, y: cell.y - 1 }) ? { type: 'see', what: 'food', where: 'up' } : null,
        this.food.get({ x: cell.x, y: cell.y + 1 }) ? { type: 'see', what: 'food', where: 'down' } : null,
        this.food.get({ x: cell.x - 1, y: cell.y }) ? { type: 'see', what: 'food', where: 'left' } : null,
        this.food.get({ x: cell.x + 1, y: cell.y }) ? { type: 'see', what: 'food', where: 'right' } : null,
      ].filter(Boolean);
    });
  }
};