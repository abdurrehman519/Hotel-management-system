require('dotenv').config();
const app = require('./app');
const { sequelize, initDatabase } = require('./config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initDatabase();
    await sequelize.authenticate();
    const dbType = process.env.USE_SQLITE === 'true' ? 'SQLite' : 'MySQL';
    console.log(`[DB] ${dbType} database connection established.`);
    await sequelize.sync();
    console.log('[DB] Models synchronized.');

    const User = require('./models/User');
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('[DB] No user records found. Auto-seeding initial database data...');
      const { runSeed } = require('./seeds/seed');
      await runSeed(false);
    }

    app.listen(PORT, () => {
      console.log(`[Server] Grand Horizon HMS running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
})();
