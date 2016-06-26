
if (process.env.DEV_TRACE) {
  Error.stackTraceLimit = Infinity;
  require('trace');
  require('clarify');
}


module.exports = {
  mongoose: {
    uri:     "mongodb://localhost/ng2",
    options: {
      server: {
        socketOptions: {
          keepAlive: 1
        },
        poolSize:      5
      }
    }
  },
  rest: {
    limit: 100,
    totalLimit: 100000
  },
  host:     '0.0.0.0',
  port:     3000,
  secret:   'mysecret',
  root:     process.cwd()
};
