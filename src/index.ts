import CanvasRender from './plugins/core/canvas-render';
import CanvasEvents from './plugins/core/canvas-events';
import RenderWindow from './plugins/core/render-window';
import SimulationTicks from './plugins/core/simulation-ticks';

import BrainsManager from './plugins/simulation/brains-manager';
import CellsManager from './plugins/simulation/cells-manager';

import Movements from './plugins/extensions/movements';
import Food from './plugins/extensions/food';
import Reproduce from './plugins/extensions/reproduce';

export default (node: HTMLElement) => {
  const canvasRender = new CanvasRender(node);
  const canvasEvents = new CanvasEvents(node);

  const renderWindow = new RenderWindow(canvasRender, canvasEvents);
  const ticks = new SimulationTicks(canvasRender, canvasEvents);

  const brains = new BrainsManager();
  const cells = new CellsManager(renderWindow, ticks, brains);

  const food = new Food(cells, renderWindow, ticks);
  const movements = new Movements(cells, brains, food);
  const reproduce = new Reproduce(cells, food, brains);
};
