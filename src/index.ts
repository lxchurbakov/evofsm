import CanvasRender from './plugins/core/canvas-render';
import CanvasEvents from './plugins/core/canvas-events';
import RenderWindow from './plugins/core/render-window';
import SimulationTicks from './plugins/core/simulation-ticks';

import BrainsManager from './plugins/simulation/brains-manager';
import CellsManager from './plugins/simulation/cells-manager';

// import Movements from './plugins/extensions/movements';
// import Food from './plugins/extensions/food';
// import Reproduce from './plugins/extensions/reproduce';
// import Vision from './plugins/extensions/vision';

import Photosynthesis from './plugins/extensions/photosynthesis';

import ReactCore from './plugins/interface/react-core';
import WindowsManager from './plugins/interface/windows-manager';
// import MainStats from './plugins/interface/main-stats';
import CellView from './plugins/interface/cell-view';

export default (node: HTMLElement) => {
  const canvasRender = new CanvasRender(node);
  const canvasEvents = new CanvasEvents(node);

  const renderWindow = new RenderWindow(canvasRender, canvasEvents);
  const ticks = new SimulationTicks(canvasRender, canvasEvents);

  const brains = new BrainsManager();
  const cells = new CellsManager(renderWindow, ticks, brains);

  const photosynthesis = new Photosynthesis(renderWindow, ticks, cells, brains);

  // const food = new Food(cells, renderWindow, ticks);
  // const movements = new Movements(cells, brains, food);
  // const reproduce = new Reproduce(cells, food, brains);
  // const vision = new Vision(brains, cells, food);

  const core = new ReactCore(node);
  const windows = new WindowsManager(core);
  // const stats = new MainStats(windows, cells);
  const view = new CellView(windows, cells, renderWindow, canvasEvents, brains);
};
