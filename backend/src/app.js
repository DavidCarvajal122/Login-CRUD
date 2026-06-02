const express = require('express');
const cors = require('cors');

const authRoutes        = require('./routes/auth.routes');
const userRoutes        = require('./routes/user.routes');
const categoriaRoutes   = require('./routes/categoria.routes');
const planRoutes        = require('./routes/plan.routes');
const ubicacionRoutes   = require('./routes/ubicacion.routes');
const tipoCompaniaRoutes = require('./routes/tipoCompania.routes');
const recomendacionRoutes = require('./routes/recomendacion.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',           authRoutes);
app.use('/api/users',          userRoutes);
app.use('/api/categorias',     categoriaRoutes);
app.use('/api/planes',         planRoutes);
app.use('/api/ubicaciones',    ubicacionRoutes);
app.use('/api/tipos-compania', tipoCompaniaRoutes);
app.use('/api/recomendaciones', recomendacionRoutes);

module.exports = app;