import { EventEmitter } from '/src/libs/events';

export type Input = any;
export type Rule = { from: number; inputs: Input[]; to: number };

const inputsEqual = (a: Input, b: Input) => JSON.stringify(a) === JSON.stringify(b);
const inputsOverlap = (rule: Input[], required: Input[]) => rule.every(($c) => required.some((c) => inputsEqual($c, c)));

export class Brain {
  constructor (public rules: Rule[], public states: number[], public actions: string[][]) {}

  public tick = (conditions: Input[]) => {
    this.states = this.rules
      .filter((rule) => this.states.indexOf(rule.from) > -1)
      .filter((rule) => inputsOverlap(rule.inputs, conditions))
      .map((r) => r.to);

    return this.states.map((s) => this.actions[s] || []).reduce((acc, a) => acc.concat(a), []);
  };
};

export const WALKING_IN_CIRCLES = new Brain([
  { from: 0, inputs: [], to: 1 },
  { from: 1, inputs: [], to: 2 },
  { from: 2, inputs: [], to: 3 },
  { from: 3, inputs: [], to: 0 },
], [0], [
  ['move/up'],
  ['move/right'],
  ['move/down'],
  ['move/left', 'reproduce'],
]);

const random = (from, to) => Math.floor(Math.random() * (to - from) + from);

export default class BrainsManager {
  private idgen = 1;
  private brains = [{ ...WALKING_IN_CIRCLES, id: 0 }] as (Brain & { id: number })[];

  public onCollectInputs = new EventEmitter();
  public onCollectOutputs = new EventEmitter();

  public get = (id: number) => this.brains.find(($brain) => $brain.id === id);
  public clone = (brainId: number) => {
    const brain = this.get(brainId) as any;
    let { rules, actions, states } = JSON.parse(JSON.stringify(brain))


    if (Math.random() > .7) {
      const mutation = ['add-input', 'clone-rule', 'remove-rule', 'change-from', 'change-to', 'add-output', 'remove-output', 'clone-output', 'remove-outputs'][Math.floor(Math.random() * 9)];

      if (mutation === 'add-input') {
        const possibleInputs = this.onCollectInputs.emitps(null).reduce((acc, c) => acc.concat(c), []);

        rules[random(0, rules.length)].inputs.push(possibleInputs[random(0, possibleInputs.length)]);
      }

      if (mutation === 'clone-rule') {
        rules.push({ ...rules[random(0, rules.length)] });
      }

      if (mutation === 'remove-rule') {
        const toRemove = random(0, rules.length);
        rules = rules.filter((r, i) => i !== toRemove);
      }

      if (mutation === 'change-from') {
        rules[random(0, rules.length)].from = random(0, actions.length);
      }
      if (mutation === 'change-to') {
        rules[random(0, rules.length)].to = random(0, actions.length);
      }

      if (mutation === 'add-output') {
        const possibleOutputs = this.onCollectOutputs.emitps(null).reduce((acc, c) => acc.concat(c), []);

        actions[random(0, actions.length)].push(possibleOutputs[random(0, possibleOutputs.length)]);
      }

      if (mutation === 'remove-output') {
        const actionIndex = random(0, actions.length);
        const toRemove = random(0, actions[actionIndex].length);

        actions[actionIndex] = actions[actionIndex].filter((a, i) => i !== toRemove);
      }

      if (mutation === 'clone-output') {
        actions.push(actions[random(0, actions.length)]);
      }

      if (mutation === 'remove-outputs') {
        const toRemove = random(0, actions.length);
        actions = actions.filter((r, i) => i !== toRemove);
      }
    }

    const id = this.idgen++;
    const newBrain = new Brain(rules, states, actions);

    this.brains.push({ id, ...newBrain });
    return id;
  };

  public tick = (brainId: number, inputs: any[]) => this.get(brainId)?.tick(inputs) || [];
};
