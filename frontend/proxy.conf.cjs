const apiPort = Number(process.env.API_PORT ?? 4000);
const target = `http://127.0.0.1:${apiPort}`;

module.exports = {
  "/api": {
    target,
    secure: false
  },
  "/health": {
    target,
    secure: false
  }
};
