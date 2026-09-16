const DEFAULT_INTERVALS = {
  hourly: 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
};

const isModelReady = (Model) =>
  Boolean(Model) &&
  typeof Model.find === "function" &&
  typeof Model.updateMany === "function";

const startJob = (name, run, intervalMs, options = {}) => {
  if (typeof run !== "function") {
    throw new TypeError(`${name} requires a run function`);
  }

  const interval = Number(intervalMs);
  if (!Number.isFinite(interval) || interval <= 0) {
    throw new RangeError(`${name} requires a positive interval`);
  }

  let timer = null;
  let running = false;

  const execute = async () => {
    if (running) {
      return { skipped: true, reason: "previous run is still active" };
    }

    running = true;
    try {
      return await run();
    } catch (error) {
      console.error(`${name} failed:`, error.message);
      if (options.rethrow) throw error;
      return { success: false, error: error.message };
    } finally {
      running = false;
    }
  };

  const start = () => {
    if (timer) return timer;
    timer = setInterval(execute, interval);
    timer.unref?.();
    if (options.runImmediately) execute();
    return timer;
  };

  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  return { execute, start, stop };
};

const startOfDay = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const endOfDay = (date = new Date()) => {
  const value = startOfDay(date);
  value.setDate(value.getDate() + 1);
  value.setMilliseconds(-1);
  return value;
};

module.exports = {
  DEFAULT_INTERVALS,
  isModelReady,
  startJob,
  startOfDay,
  endOfDay,
};
