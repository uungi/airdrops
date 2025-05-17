import express from 'express';
import { handler as apiHandler } from './routes';
import { viteHandler } from './vite';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// API routes
app.use('/api', apiHandler);

// Static files for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'dist/public')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist/public/index.html'));
  });
} else {
  const server = app.listen(port);
  viteHandler(app, server);
}

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

export default app;