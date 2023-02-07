const server = require('./api/server.js');

global.SECRET = process.env.SECRET || 'mysecretkey';
global.HASHING_ROUND = process.env.HASHING_ROUND || 8;

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`\n=== Server listening on port ${PORT} ===\n`);
});
