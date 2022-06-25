import CanvasRender from './plugins/core/canvas-render';
import CanvasEvents from './plugins/core/canvas-events';
import RenderWindow from './plugins/core/render-window';
import SimulationTicks from './plugins/core/simulation-ticks';

import BrainsManager, { Brain } from './plugins/simulation/brains-manager';
import CellsManager from './plugins/simulation/cells-manager';
import MutationsManager from './plugins/simulation/mutations-manager';

import Food from '/src/plugins/environment/food';
import Reproducing from '/src/plugins/environment/reproducing';
import Movements from '/src/plugins/environment/movements';
import Sunlight from '/src/plugins/environment/sunlight';

// import Movements from './plugins/extensions/movements';
// import Food from './plugins/extensions/food';
// import Reproduce from './plugins/extensions/reproduce';
// import Vision from './plugins/extensions/vision';

// import Photosynthesis from './plugins/extensions/photosynthesis';

// import ReactCore from './plugins/interface/react-core';
// import WindowsManager from './plugins/interface/windows-manager';
// import MainStats from './plugins/interface/main-stats';
// import CellView from './plugins/interface/cell-view';

export default (node: HTMLElement) => {
  const canvasRender = new CanvasRender(node);
  const canvasEvents = new CanvasEvents(node);

  const renderWindow = new RenderWindow(canvasRender, canvasEvents);
  const ticks = new SimulationTicks(canvasRender, canvasEvents);

  const brains = new BrainsManager();
  const cells = new CellsManager(renderWindow, ticks, brains);
  const mutations = new MutationsManager(brains);

  const food = new Food(renderWindow, cells, ticks);
  const reproducing = new Reproducing(mutations, brains, cells, food);
  const movements = new Movements(cells);
  const sunlight = new Sunlight(renderWindow, ticks, food);

  // const photosynthesis = new Photosynthesis(renderWindow, ticks, cells, brains);

  // const food = new Food(cells, renderWindow, ticks);
  // const movements = new Movements(cells, brains, food);
  // const reproduce = new Reproduce(cells, food, brains);
  // const vision = new Vision(brains, cells, food);

  // const core = new ReactCore(node);
  // const windows = new WindowsManager(core);
  // const stats = new MainStats(windows, cells);
  // const view = new CellView(windows, cells, renderWindow, canvasEvents, brains);

  // Create the very first cell

  const simpleBrainId = brains.save(new Brain(0, [{ from: 0, clues: [], to: 0 }], [['move/random', 'reproduce']]));
  const cellId = cells.spawn({ x: 0, y: 0 }, simpleBrainId);

  food.setFullness(cellId, 100);

  sunlight.spawn({ x: 0, y: 0, r: 10 })
};
