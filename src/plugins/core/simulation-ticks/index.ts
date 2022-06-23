import CanvasRender from '/src/plugins/core/canvas-render';
import CanvasEvents from '/src/plugins/core/canvas-events';

export type TickerConfig = { interval: number; color: string; };
export type Ticker = { id: number; current: number; timeout: number; config: TickerConfig; cb: any; };

const TICKER_INNER_RADIUS = 10;
const TICKER_OUTER_RADIUS = 16;

const TICKER_PADDING = 26;
const TICKER_PADDING_BETWEEN = 10;

export default class SimulationTicks {
  // Store the tickers and the idgenerator
  private idgenerator = 12;
  private tickers = [] as Ticker[];

  private current = () => new Date().getTime();

  // Hook on rendering to display tickers
  constructor (private canvas: CanvasRender, private events: CanvasEvents) {
    this.canvas.onRender.on(this.render);
    this.events.onKeyDown.on(this.handleKeyDown)
  }

  public paused = false;

  public pause = () => {
    this.tickers.forEach((ticker) => {
      clearInterval(ticker.timeout);
    });
    this.paused = true;
  };

  public resume = () => {
    this.tickers.forEach((ticker) => {
      ticker.timeout = setInterval(() => {
        ticker.current = this.current();
        ticker.cb();
      }, ticker.config.interval);
    });

    this.paused = false;
  };

  // Create a method to add ticker and start rendering it
  public add = <T extends () => void>(config: TickerConfig, cb: T) => {
    const id = this.idgenerator++;
    const current = this.current();

    // Create an actual timeout and start calling callback
    const timeout = setInterval(() => {
      const ticker = this.tickers.find(($ticker) => $ticker.id === id);

      if (ticker) {
        ticker.current = this.current();
        ticker.cb();
      }
    }, config.interval);

    this.tickers.push({ id, current, timeout, config, cb });

    // Return a method that can be used to dispose the ticker
    return () => {
      const ticker = this.tickers.find(($ticker) => $ticker.id === id);

      if (ticker) {
        clearInterval(ticker.timeout);
      }

      this.tickers = this.tickers.filter(($ticker) => $ticker.id !== id);
    };
  };

  // Render the tickers as radial countdowns
  private render = (context: CanvasRenderingContext2D) => {
    const { rect } = this.canvas;

    this.tickers.forEach((ticker, index) => {
      const offset = (new Date().getTime() - ticker.current) / ticker.config.interval;
      const x = TICKER_PADDING + (index * (TICKER_OUTER_RADIUS * 2 + TICKER_PADDING_BETWEEN));
      const y = rect.height - TICKER_PADDING;

      const start = -1/2 * Math.PI;
      const end = -1/2 * Math.PI + (offset * 2 * Math.PI);

      context.fillStyle = ticker.config.color;

      context.beginPath();
      context.arc(x, y, TICKER_INNER_RADIUS, start, end);
      context.arc(x, y, TICKER_OUTER_RADIUS, end, start, true);
      context.closePath();
      context.fill();
    });
  };

  private handleKeyDown = (key: number) => {
    if (key === 32) {
      if (this.paused) {
        this.resume();
      } else {
        this.pause();
      }
    }
  };
};
