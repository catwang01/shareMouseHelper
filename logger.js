function log(...message) {
  const now = new Date();
  console.log(`[${now.toISOString()}]`, ...message);
}

module.exports = log;
