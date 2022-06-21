import RenderWindow from '/src/plugins/core/render-window';

const GRID_SIZE = 20;
const CELL_COLOR = '#2196f3';
const FOOD_COLOR = '#4caf50';

export default class CellsManager {
  public cells = [{ x: 10, y: 10 }];
  public food = [{ x: 12, y: 10 }];

  constructor (private window: RenderWindow) {
    this.window.onRender.on(this.render);
  };

  private render = (context: CanvasRenderingContext2D) => {
    context.fillStyle = CELL_COLOR;

    this.cells.forEach((cell) => {
      context.beginPath();
      context.rect(cell.x * GRID_SIZE, cell.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      context.fill();
    });

    context.fillStyle = FOOD_COLOR;

    this.food.forEach((cell) => {
      context.beginPath();
      context.rect(cell.x * GRID_SIZE, cell.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      context.fill();
    });
  };
};
