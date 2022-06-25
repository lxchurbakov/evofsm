import BrainsManager from '/src/plugins/simulation/brains-manager';

import { EventEmitter } from '/src/libs/events';

const CLONE_RULE_POSSIBILITY = .3;
const ADD_RULE_CLUE_POSSIBILITY = .1;
const ALTER_RULE_FROM_POSSIBILITY = .07;
const ALTER_RULE_TO_POSSIBILITY = .07;
const CLONE_ACTION_POSSIBILITY = .1;
const ADD_ACTION_POSSIBILITY = .05;
const REMOVE_ACTION_POSSIBILITY = .05;

const random = (from: number, to: number) => Math.floor(Math.random() * (to - from) + from);
const randomOf = <C extends any[]>(c: C) => c[Math.floor(Math.random() * c.length)];

export default class MutationsManager {
  public onCollectClues = new EventEmitter();
  public onCollectActions = new EventEmitter();

  private clues = () => this.onCollectClues.emitps(null).reduce((acc, v) => acc.concat(v), []);
  private actions = () => this.onCollectActions.emitps(null).reduce((acc, v) => acc.concat(v), []);

  constructor (private brains: BrainsManager) {
    this.brains.onMutate.on(({ state, rules, actions }) => {
      if (Math.random() < CLONE_RULE_POSSIBILITY) {
        rules.push(randomOf(rules));
      }

      if (Math.random() < ADD_RULE_CLUE_POSSIBILITY) {
        randomOf(rules).clues.push(randomOf(this.clues()));
      }

      if (Math.random() < ALTER_RULE_FROM_POSSIBILITY) {
        randomOf(rules).from += random(-1, 2);
      }

      if (Math.random() < ALTER_RULE_TO_POSSIBILITY) {
        randomOf(rules).to += random(-1, 2);
      }

      if (Math.random() < CLONE_ACTION_POSSIBILITY) {
        actions.push(randomOf(actions));
      }

      if (Math.random() < ADD_ACTION_POSSIBILITY) {
        randomOf(actions).push(randomOf(this.actions()));
      }

      if (Math.random() < REMOVE_ACTION_POSSIBILITY) {
        const index = random(0, actions.length);

        actions[index].splice(random(0, actions[index].length), 1);
      }

      return { state, rules, actions };
    });
  }
};
