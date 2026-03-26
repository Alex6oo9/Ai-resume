import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import app from './app';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Hard limit: abort any request still pending after 120s (prevents zombie connections)
server.requestTimeout = 120000;
// Keep-alive connections: must be > nginx default (60s)
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
