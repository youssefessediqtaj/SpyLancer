const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const INTERNAL_KEY = process.env.INTERNAL_KEY || 'spylancer_internal_secret';

// Internal Security Middleware
const internalOnly = (req, res, next) => {
    if (req.headers['x-internal-key'] !== INTERNAL_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};

app.use(internalOnly);

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Auth Service connected to MongoDB'))
    .catch(err => console.error('Auth Service MongoDB error:', err));

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Basic password strength
        if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

        const user = new User({ name, email, password });
        await user.save();
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ status: 'success', token, user: { id: user._id, name, email, plan: user.plan } });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ status: 'success', token, user: { id: user._id, name: user.name, email, plan: user.plan } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        res.json({ status: 'success', user: { id: user._id, name: user.name, email: user.email, plan: user.plan } });
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

app.put('/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const updates = {};
        if (req.body.name) updates.name = req.body.name;
        if (req.body.email) updates.email = req.body.email;
        if (req.body.password) {
            if (req.body.password.length < 8) return res.status(400).json({ error: 'Password too weak' });
            updates.password = await bcrypt.hash(req.body.password, 10);
        }

        const user = await User.findByIdAndUpdate(decoded.id, updates, { new: true });
        res.json({ status: 'success', user: { id: user._id, name: user.name, email: user.email, plan: user.plan } });
    } catch (e) {
        res.status(401).json({ error: 'Failed to update profile' });
    }
});

app.listen(3007, () => console.log("Auth Service running on 3007"));
