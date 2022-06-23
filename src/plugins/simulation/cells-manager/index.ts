import { EventEmitter } from '/src/libs/events';

import { Point } from '/src/plugins/core/canvas-events';

import RenderWindow from '/src/plugins/core/render-window';
import SimulationTicks from '/src/plugins/core/simulation-ticks';

import BrainsManager from '/src/plugins/simulation/brains-manager';

const GRID_SIZE = 20; // TODO GRID SIZE global constant
const CELL_COLOR = '#2196f3';

export default class CellsManager {
  private idgenerator = 1;

  public onNewCell = new EventEmitter<number>();
  public onRemoveCell = new EventEmitter<number>();


  public cells = [{ id: 0, x: 10, y: 10, brainId: 0 }];

  public add = (p: Point, brainId: number) => {
    const id = this.idgenerator++;
    this.cells.push({ ...p, id, brainId });
    this.onNewCell.emitps(id);
  }
  public get = (id: number) => this.cells.find((c) => c.id === id);
  public update = (id: number, u) => this.cells = this.cells.map((c) => c.id === id ? u(c) : c);
  public remove = (id: number) => {
    this.cells = this.cells.filter((c) => c.id !== id);
    this.onRemoveCell.emitps(id);
  }
  public ids = () => this.cells.map((c) => c.id);

  constructor (private window: RenderWindow, private ticks: SimulationTicks, private brains: BrainsManager) {
    // Setup cells rendering
    this.window.onRender.on(this.render);

    // Setup cells thinking
    this.ticks.add({ interval: 200, color: CELL_COLOR }, this.think);
  };

  // Render cells
  private render = (context: CanvasRenderingContext2D) => {
    context.fillStyle = CELL_COLOR;

    this.cells.forEach((cell) => {
      context.beginPath();
      context.rect(cell.x * GRID_SIZE, cell.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      context.fill();
    });
  };

  // Handle ticks of life

  public onDataInput = new EventEmitter();
  public onDataOutput = new EventEmitter();
  public onAfterTick = new EventEmitter();

  private think = () => {
    this.cells.forEach((cell) => {
      const inputs = this.onDataInput.emitps(cell.id);
      const outputs = this.brains.tick(cell.brainId, inputs);



      if (outputs.length === 0) {
        // this.cells.remove
        // console.log('braindead', cell.id, cell.brainId, this.brains.get(cell.brainId))
        this.remove(cell.id);
      } else {
        outputs.forEach((action) => this.onDataOutput.emitps({ id: cell.id, action }));
        this.onAfterTick.emitps(cell.id); // do the post action handling for food eating and dying and other stuff
      }


      // console.log(this.cells)
    });
  };
};
