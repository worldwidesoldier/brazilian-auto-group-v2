// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const app = express();
const PORT = 5000; // Você pode escolher uma porta diferente

app.use(cors());
app.use(bodyParser.json());

// In-memory storage for cars (replace with a database later)
let cars = [];

// Simple authentication (for demonstration purposes only)
const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'password';

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const [type, token] = authHeader.split(' ');

        if (type === 'Basic') {
            const credentials = Buffer.from(token, 'base64').toString('ascii').split(':');
            const username = credentials[0];
            const password = credentials[1];

            if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
                return next();
            }
        }
    }

    res.status(401).send('Authentication required');
};

// --- API Endpoints ---

// GET /api/cars - Get all cars
app.get('/api/cars', (req, res) => {
    res.json(cars);
});

// GET /api/cars/:id - Get a specific car
app.get('/api/cars/:id', (req, res) => {
    const carId = req.params.id;
    const car = cars.find(c => c.id === carId);
    if (car) {
        res.json(car);
    } else {
        res.status(404).send('Car not found');
    }
});

// POST /api/cars - Add a new car (requires authentication)
app.post('/api/cars', authenticate, (req, res) => {
    const newCar = { ...req.body, id: uuidv4() };
    cars.push(newCar);
    res.status(201).json(newCar);
});

// PUT /api/cars/:id - Update a car (requires authentication)
app.put('/api/cars/:id', authenticate, (req, res) => {
    const carId = req.params.id;
    const index = cars.findIndex(c => c.id === carId);
    if (index !== -1) {
        cars[index] = { ...cars[index], ...req.body };
        res.json(cars[index]);
    } else {
        res.status(404).send('Car not found');
    }
});

// DELETE /api/cars/:id - Delete a car (requires authentication)
app.delete('/api/cars/:id', authenticate, (req, res) => {
    const carId = req.params.id;
    cars = cars.filter(c => c.id !== carId);
    res.status(204).send(); // No content on successful deletion
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
