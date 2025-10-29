const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuración de MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/torneo-quemados', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
    console.log('✅ Conectado a MongoDB exitosamente');
});

// Esquemas de MongoDB
const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    players: [{
        name: String,
        position: String,
        captain: Boolean
    }],
    stats: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        draws: { type: Number, default: 0 },
        goalsFor: { type: Number, default: 0 },
        goalsAgainst: { type: Number, default: 0 },
        points: { type: Number, default: 0 }
    },
    logo: String,
    createdAt: { type: Date, default: Date.now }
});

const matchSchema = new mongoose.Schema({
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    date: { type: Date, required: true },
    venue: String,
    status: { type: String, enum: ['scheduled', 'in_progress', 'completed'], default: 'scheduled' },
    score: {
        home: { type: Number, default: 0 },
        away: { type: Number, default: 0 }
    },
    events: [{
        type: String,
        player: String,
        team: String,
        minute: Number,
        description: String
    }],
    createdAt: { type: Date, default: Date.now }
});


// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Configuración de Nodemailer
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// Rutas API


// Equipos
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.find().sort({ 'stats.points': -1 });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener equipos', error: error.message });
    }
});

app.post('/api/teams', async (req, res) => {
    try {
        const team = new Team(req.body);
        await team.save();
        io.emit('teamAdded', team);
        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear equipo', error: error.message });
    }
});

app.put('/api/teams/:id', async (req, res) => {
    try {
        const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
        io.emit('teamUpdated', team);
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar equipo', error: error.message });
    }
});

// Partidos
app.get('/api/matches', async (req, res) => {
    try {
        const matches = await Match.find()
            .populate('homeTeam')
            .populate('awayTeam')
            .sort({ date: 1 });
        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener partidos', error: error.message });
    }
});

app.post('/api/matches', async (req, res) => {
    try {
        const match = new Match(req.body);
        await match.save();
        io.emit('matchAdded', match);
        res.status(201).json(match);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear partido', error: error.message });
    }
});

app.put('/api/matches/:id/score', async (req, res) => {
    try {
        const { homeScore, awayScore } = req.body;
        const match = await Match.findByIdAndUpdate(req.params.id, {
            'score.home': homeScore,
            'score.away': awayScore,
            status: 'completed'
        }, { new: true }).populate('homeTeam').populate('awayTeam');

        // Actualizar estadísticas de equipos
        await updateTeamStats(match);
        
        io.emit('matchUpdated', match);
        res.json(match);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar partido', error: error.message });
    }
});

// Estadísticas
app.get('/api/stats', async (req, res) => {
    try {
        const totalMatches = await Match.countDocuments();
        const completedMatches = await Match.countDocuments({ status: 'completed' });
        const totalTeams = await Team.countDocuments();
        const totalGoals = await Match.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: { $add: ['$score.home', '$score.away'] } } } }
        ]);

        res.json({
            totalMatches,
            completedMatches,
            totalTeams,
            totalGoals: totalGoals[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
});

// Subida de archivos
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No se subió ningún archivo' });
    }
    res.json({ 
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`
    });
});

// Envío de emails
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'quemadosoffice1102@gmail.com',
            subject: `Nuevo mensaje de ${name}`,
            text: `
                Nombre: ${name}
                Email: ${email}
                Mensaje: ${message}
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Mensaje enviado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al enviar mensaje', error: error.message });
    }
});

// Socket.io para tiempo real
io.on('connection', (socket) => {
    console.log('🔌 Usuario conectado:', socket.id);

    socket.on('joinMatch', (matchId) => {
        socket.join(`match-${matchId}`);
        console.log(`Usuario ${socket.id} se unió al partido ${matchId}`);
    });

    socket.on('leaveMatch', (matchId) => {
        socket.leave(`match-${matchId}`);
        console.log(`Usuario ${socket.id} salió del partido ${matchId}`);
    });

    socket.on('disconnect', () => {
        console.log('🔌 Usuario desconectado:', socket.id);
    });
});

// Función para actualizar estadísticas de equipos
async function updateTeamStats(match) {
    const { homeTeam, awayTeam, score } = match;
    
    // Actualizar equipo local
    const homeTeamDoc = await Team.findById(homeTeam._id);
    homeTeamDoc.stats.goalsFor += score.home;
    homeTeamDoc.stats.goalsAgainst += score.away;
    
    if (score.home > score.away) {
        homeTeamDoc.stats.wins += 1;
        homeTeamDoc.stats.points += 3;
    } else if (score.home < score.away) {
        homeTeamDoc.stats.losses += 1;
    } else {
        homeTeamDoc.stats.draws += 1;
        homeTeamDoc.stats.points += 1;
    }
    
    await homeTeamDoc.save();

    // Actualizar equipo visitante
    const awayTeamDoc = await Team.findById(awayTeam._id);
    awayTeamDoc.stats.goalsFor += score.away;
    awayTeamDoc.stats.goalsAgainst += score.home;
    
    if (score.away > score.home) {
        awayTeamDoc.stats.wins += 1;
        awayTeamDoc.stats.points += 3;
    } else if (score.away < score.home) {
        awayTeamDoc.stats.losses += 1;
    } else {
        awayTeamDoc.stats.draws += 1;
        awayTeamDoc.stats.points += 1;
    }
    
    await awayTeamDoc.save();
}

// Ruta para servir la aplicación React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📱 Aplicación disponible en: http://localhost:${PORT}`);
    console.log(`🔌 Socket.io habilitado para tiempo real`);
    console.log(`🗄️  Base de datos: MongoDB`);
    console.log(`📧 Email configurado: ${process.env.EMAIL_USER ? 'Sí' : 'No'}`);
});

module.exports = app; 
