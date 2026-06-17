import app from './app';
import { env } from './config/env';
import { initRedis, shutdownRedis } from './infra/redis';

const PORT = env.PORT;

async function bootstrap() {
  try {
    await initRedis();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

bootstrap();

// Graceful shutdown
process.on('SIGINT', async () => {
  await shutdownRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdownRedis();
  process.exit(0);
});