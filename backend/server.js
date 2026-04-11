import "dotenv/config.js";
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/health', (req, res) => {
    res.send({ 'status': 'ok' });
});
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}.`);
});
