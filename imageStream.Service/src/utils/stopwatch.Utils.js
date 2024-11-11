// utils/stopwatch.js
/*global process*/ 
const getStartStopWatchForDebug = () => {
  let stopWatch = null;

  if (process.env.DEBUG_MODE === "true") {
    stopWatch = {
      startTime: process.hrtime(), // Start the high-resolution timer
      start: function () {
        this.startTime = process.hrtime();
      },
      elapsedTime: function () {
        const diff = process.hrtime(this.startTime);
        return diff[0] * 1000 + diff[1] / 1e6; // Convert to milliseconds
      },
    };
    stopWatch.start(); // Start the stopwatch
  }

  return stopWatch;
};

export { getStartStopWatchForDebug };
