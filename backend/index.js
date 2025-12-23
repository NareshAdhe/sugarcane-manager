const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server is running professionally on port ${PORT}`);
  console.log(`👉 Test it at: http://10.145.211.171:${PORT}`);
});