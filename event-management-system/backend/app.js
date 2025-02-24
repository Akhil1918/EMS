const equipmentRoutes = require('./routes/equipmentRoutes');
app.use('/api/equipment', equipmentRoutes);

// Ensure proper CORS setup
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // Match frontend port
  credentials: true
})); 