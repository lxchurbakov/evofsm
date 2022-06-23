import CellsManager from '/src/plugins/simulation/cells-manager';

import RenderWindow from '/src/plugins/core/render-window';
import SimulationTicks from '/src/plugins/core/simulation-ticks';

const GRID_SIZE = 20;
const FOOD_COLOR = '#4caf50';

const STANDARD_VALUE = 25;
const DEAD_VALUE = 6;

export default class FoodActions {
  private idgen = 0;
  public food = [] as { x: number, y: number, id: number, value: number }[];
  public fullness = { '0': 30 } as any;

  constructor (private cells: CellsManager, private window: RenderWindow, private ticks: SimulationTicks) {
    // First of all let's render all the food
    this.window.onRender.on((context: CanvasRenderingContext2D) => {
      context.fillStyle = FOOD_COLOR;

      this.food.forEach((cell) => {
        context.beginPath();
        context.rect(cell.x * GRID_SIZE, cell.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        context.fill();
      });
    });

    // Check if the cell has eaten the food
    this.cells.onAfterTick.on(() => {
      this.cells.ids().map((id) => {
        const cell = this.cells.get(id) as any;

        this.food.forEach((food) => {
          if (cell.x === food.x && cell.y === food.y) {
            // Food consumption
            this.fullness[id] = (this.fullness[id] || 0) + food.value;
            this.food = this.food.filter((f) => f.id !== food.id);
          }
        });
      });
    });

    // Spawn food everywhere but don't collide with existing
    // food or cells
    this.ticks.add({ interval: 100, color: 'green' }, () => {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);

      const spaceOccupiedByFood = this.food.some(($food) => $food.x === x && $food.y === y);
      const spaceOccupiedByCell = this.cells.cells.some(($cell) => $cell.x === x && $cell.y === y);

      if (!spaceOccupiedByCell && !spaceOccupiedByFood) {
        this.food.push({ id: this.idgen++, x, y, value: STANDARD_VALUE });
      }
    });

    // Decrease fullness by timer
    this.ticks.add({ interval: 600, color: 'red' }, () => {
      Object.keys(this.fullness).forEach((id) => {
        if (this.fullness[id] < 1) {
          const cell = this.cells.get(parseInt(id));

          if (cell) {
            const { x, y } = cell;

            this.food.push({ id: this.idgen++, x, y, value: DEAD_VALUE })
            this.cells.remove(parseInt(id));
            delete this.fullness[id];
          }
        } else {
          this.fullness[id]--;
        }
      });
    });
  }
};