import RenderWindow from '/src/plugins/core/render-window';
import CellsManager from '/src/plugins/simulation/cells-manager';
import SimulationTicks from '/src/plugins/core/simulation-ticks';

import { Point } from '/src/libs/utils';

export type Food = Point & { value: number };

const GRID_SIZE = 20;
const FOOD_COLOR = '#4caf50';

export default class FoodManager {
  public food = new Map<Point, number>();
  public fullness = new Map<number, number>();

  public get = (p: Point) => this.food.get(p);
  public spawn = (p: Point, value: number) => this.food.set(p, value);
  public despawn = (p: Point) => this.food.delete(p);

  public getFullness = (id: number) => this.fullness.get(id);
  public setFullness = (id: number, value: number) => this.fullness.set(id, value);
  public removeFullness = (id: number) => this.fullness.delete(id);

  constructor (private renderWindow: RenderWindow, private cells: CellsManager, private ticks: SimulationTicks) {
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
        const food = this.food.get(p);

        if (food) {
          this.setFullness(id, fullness + food);
          this.despawn(p)
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
  }
};