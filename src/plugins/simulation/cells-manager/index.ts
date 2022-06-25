import { EventEmitter } from '/src/libs/events';

import { Point } from '/src/plugins/core/canvas-events';

import RenderWindow from '/src/plugins/core/render-window';
import SimulationTicks from '/src/plugins/core/simulation-ticks';

import BrainsManager, { Brain } from '/src/plugins/simulation/brains-manager';

const GRID_SIZE = 20; // TODO GRID SIZE global constant
const CELL_COLOR = '#2196f3';

export type Cell = Point & { brainId: number };

export default class CellsManager {
  private idgen = 1;
  public cells = new Map<number, Cell>();

  public onNewCell = new EventEmitter<number>();
  public onRemoveCell = new EventEmitter<number>();

  public spawn = (p: Point, brainId: number) => { const id = this.idgen++; this.cells.set(id, { ...p, brainId }); return id; };
  public despawn = (id: number) => this.cells.delete(id);
  public get = (id: number) => this.cells.get(id);
  public update = (id: number, u: (cell: Cell) => Cell) => { const cell = this.get(id); if (cell) this.cells.set(id, u(cell)); };
  public ids = () => this.cells.keys();

  public onCollectClues = new EventEmitter();
  public onSubmitAction = new EventEmitter();
  public onAfterAction  = new EventEmitter();

  constructor (private window: RenderWindow, private ticks: SimulationTicks, private brains: BrainsManager) {
    // Setup cells rendering
    this.window.onRender.on((context: CanvasRenderingContext2D) => {
      context.fillStyle = CELL_COLOR;

      this.cells.forEach((cell) => {
        context.beginPath();
        context.rect(cell.x * GRID_SIZE, cell.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        context.fill();
      });
    });

    // Setup cells thinking
    this.ticks.add({ interval: 200, color: CELL_COLOR }, () => {
      for (let [id, cell] of this.cells.entries()) {
        const clues = this.onCollectClues.emitps(id);
        const actions = this.brains.tick(cell.brainId, clues);

        // if (actions.length === 0)  kill cell
        actions.forEach((action) => this.onSubmitAction.emitps({ id, action }));
        this.onAfterAction.emitps(id);
      }
    });

    // Create the very first cell

    const simpleBrainId = this.brains.save(new Brain(0, [{ from: 0, clues: [], to: 0 }], [['move/random', 'reproduce']]));

    this.spawn({ x: 0, y: 0 }, simpleBrainId)
  };
};
