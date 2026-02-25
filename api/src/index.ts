import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import promptRoutes from './routes/prompts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dotenv.config();

// Configure Day.js for Shanghai Timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Shanghai');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for simple deployment to avoid issues with inline scripts/styles
}));
app.use(cors());
app.use(express.json());

// Trust Proxy for IP extraction if behind Nginx/Vercel
app.set('trust proxy', true);

// API Routes
app.use('/api/prompts', promptRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve Static Files (Frontend)
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Handle SPA Routing - Send index.html for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
