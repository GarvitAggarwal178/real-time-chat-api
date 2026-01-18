const express = require('express');
const app = express();

const PORT = 8000;

app.get('/', (req, res) => {
    res.send('Chat API is running');
});

app.get('/about', (req, res) => {
    res.send('<h1>About Page</h1><p>This is a chat API</p>');
});

app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date(),
        version: '1.0.0'
    });
});

app.post('/api/echo', (req, res) => {
    res.json({ message: 'Echo endpoint' });
});

app.get('/api/time', (req, res) => {
    const now = new Date();
    res.json({ time: now.toISOString() });
});

app.get('/hello/:name', (req, res) => {
    const name = req.params.name;
    res.json({ greeting: `Hello, ${name}!` });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

