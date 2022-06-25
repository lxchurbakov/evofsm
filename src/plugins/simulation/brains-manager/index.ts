// Brains Manager Plugin
// keeps the track of all the brains in the application
// adds cloning mechanism, adds mutation to the brain
// and is extendable with this process
import { EventEmitter } from '/src/libs/events';

export type Clue = any;
export type Rule = { from: number; clues: Clue[]; to: number };

const inputsEqual = (a: Clue, b: Clue) => JSON.stringify(a) === JSON.stringify(b);
const inputsOverlap = (rule: Clue[], required: Clue[]) => rule.every(($c) => required.some((c) => inputsEqual($c, c)));

export class Brain {
  constructor (public state: number, public rules: Rule[], public actions: string[][]) {}

  public tick = (clues: Clue[]) => {
    this.state = this.rules
      .filter((rule) => this.state === rule.from)
      .filter((rule) => inputsOverlap(rule.clues, clues))
      .map((r) => r.to)[0];

    return this.actions[(this.actions.length + (this.state % this.actions.length)) % this.actions.length];
  };
};

export default class BrainsManager {
  private idgen = 1;
  private brains = new Map<number, Brain>();

  public onMutate = new EventEmitter();

  public get = (id: number) => this.brains.get(id);
  public save = (brain: Brain) => { const id = this.idgen++; this.brains.set(id, brain); return id; };
  public remove = (id: number) => this.brains.delete(id);

  public tick = (id: number, clues: Clue[]) => this.get(id)?.tick(clues) || [];

  c = 0;

  public reproduce = (id: number) => {
    const parentBrain = this.get(id);

    if (!parentBrain) throw new Error(`Brain ${id} is not found`);

    const { state, rules, actions } = this.onMutate.emitss(JSON.parse(JSON.stringify(parentBrain)));

    if ((this.c++)%50 === 0) {
      console.log({ rules, actions })
    }

    return this.save(new Brain(state, rules, actions));
  };
};
