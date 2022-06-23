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

        const patch = {
          up: { x: 0, y: -1 },
          down: { x: 0, y: +1 },
          left: { x: -1, y: 0 },
          right: { x: +1, y: 0 },
        }[direction] as any;

        const cell = this.cells.get(id) as any;

        const x = cell.x + patch.x;
        const y = cell.y + patch.y;

        const spaceOccupiedByCell = this.cells.cells.some(($cell) => $cell.x === x && $cell.y === y);

        if (!spaceOccupiedByCell) {
          this.cells.update(id, (cell) => ({ ...cell, x, y }))
        }
      }
    });
  }
};
