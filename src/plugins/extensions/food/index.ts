import CellsManager from '/src/plugins/simulation/cells-manager';

import RenderWindow from '/src/plugins/core/render-window';
import SimulationTicks from '/src/plugins/core/simulation-ticks';

const GRID_SIZE = 20;
const FOOD_COLOR = '#4caf50';

export default class FoodActions {
  private idgen = 0;
  public food = [{ id: 0, x: 11, y: 10 }];
  public fullness = { '0': 30 } as any;

  constructor (private cells: CellsManager, private window: RenderWindow, private ticks: SimulationTicks) {
    // First of all let's render all the food
    this.window.onRender.on(this.render);

    // Check if the cell has eaten the food
    this.cells.onAfterTick.on(() => {
      this.cells.ids().map((id) => {
        const cell = this.cells.get(id) as any;

        this.food.forEach((food) => {
          if (cell.x === food.x && cell.y === food.y) {
            // Food consumption
            this.fullness[id] = (this.fullness[id] || 0) + 50;
            this.food = this.food.filter((f) => f.id !== food.id);
          }
        });
      });
    });

    this.ticks.add({ interval: 100, color: 'green' }, () => {
      this.food.push({
        id: this.idgen++,
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20),
      });
    });

    this.cells.onNewCell.on((id) => {
      this.fullness[id] = 10;
    });

    this.cells.onRemoveCell.on((id) => {
      delete this.fullness[id];
    });

    this.ticks.add({ interval: 600, color: 'red' }, () => {
      Object.keys(this.fullness).forEach((id) => {
        if (this.fullness[id] < 1) {
          const { x, y } = this.cells.get(parseInt(id)) as any;
          // this.food.push({ id: this.idgen++, x, y });
          this.cells.remove(parseInt(id));
        } else {
          this.fullness[id]--;
        }
      });
      // console.log(this.fullness)
      // this.food.push({
      //   id: this.idgen++,
      //   x: Math.floor(Math.random() * 20),
      //   y: Math.floor(Math.random() * 20),
      // })
    });

    // this.cells.onConditions.on((id: number) => {
    //
    // });

    // this.cells.onAction.on(({ id, action }: { id: number, action: string }) => {
    //   if (action.startsWith('move/')) {
    //     const [,direction] = action.split('/');
    //
    //     const patch = {
    //       up: { x: 0, y: -1 },
    //       bottom: { x: 0, y: +1 },
    //       left: { x: -1, y: 0 },
    //       right: { x: +1, y: 0 },
    //     }[direction] as any;
    //
    //     this.cells.update(id, (cell) => ({
    //       ...cell,
    //       x: cell.x + patch.x,
    //       y: cell.y + patch.y,
    //     }))
    //   }
    //
    //   // if (action === 'reproduce') {
    //   //
    //   // }
    // });
  }

  // Render cells
  private render = (context: CanvasRenderingContext2D) => {
    context.fillStyle = FOOD_COLOR;

    this.food.forEach((cell) => {
      context.beginPath();
      context.rect(cell.x * GRID_SIZE, cell.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      context.fill();
    });
  };
};