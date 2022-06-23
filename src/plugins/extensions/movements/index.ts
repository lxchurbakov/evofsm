import BrainsManager from '/src/plugins/simulation/brains-manager';
import CellsManager from '/src/plugins/simulation/cells-manager';

import Food from '/src/plugins/extensions/food';

export default class BasicActions {
  constructor (private cells: CellsManager, private brains: BrainsManager, private food: Food) {
    this.brains.onCollectOutputs.on(() => ([
      'move/up',
      'move/right',
      'move/down',
      'move/left',
    ]));

    this.cells.onDataOutput.on(({ id, action }: { id: number, action: string }) => {
      if (action.startsWith('move/')) {
        const [,direction] = action.split('/');

        // this.food.fullness[id] -= 1;
        // console.log(this.food)

        const patch = {
          up: { x: 0, y: -1 },
          down: { x: 0, y: +1 },
          left: { x: -1, y: 0 },
          right: { x: +1, y: 0 },
        }[direction] as any;

        this.cells.update(id, (cell) => ({
          ...cell,
          x: cell.x + patch.x,
          y: cell.y + patch.y,
        }))
      }

    });
  }
};
