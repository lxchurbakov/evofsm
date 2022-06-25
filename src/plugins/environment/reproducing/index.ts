import BrainsManager from '/src/plugins/simulation/brains-manager';
import CellsManager from '/src/plugins/simulation/cells-manager';

import MutationsManager from '/src/plugins/simulation/mutations-manager';
import Food from '/src/plugins/environment/food';

export default class Reproducing {
  constructor (private mutations: MutationsManager, private brains: BrainsManager, private cells: CellsManager, private food: Food) {
    // this.mutations.
    // this.brains.onCollectOutputs.on(() => ([
    //   'reproduce'
    // ]));

    this.cells.onSubmitAction.on(({ id, action }) => {
      if (action === 'reproduce') {
        const fullness = this.food.getFullness(id) || 0;
        if (fullness > 15) {
          const cell = this.cells.get(id) as any; // TODO

          const x = cell.x + Math.floor(Math.random() * 3 - 1);
          const y = cell.y + Math.floor(Math.random() * 3 - 1);

          const spaceOccupiedByCell = Array.from(this.cells.ids()).some(($id) => {
            const $cell = this.cells.get($id) as any;

            return $cell.x === x && $cell.y === y;
          });

          if (!spaceOccupiedByCell) {
            const newCellBrainId = this.brains.reproduce(cell.brainId);
            const newCellId = this.cells.spawn({ x, y }, newCellBrainId);

            this.food.setFullness(newCellId, 15);
            this.food.setFullness(id, fullness - 15);
          }
        }
      }
    });
  }
};
