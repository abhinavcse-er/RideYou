import { validateEnvironment, env } from './src/config/env.js';
import app from './src/app.js';

validateEnvironment();

app.listen(env.port, () => {
  console.log(`RideYou API listening on port ${env.port}`);
});
