import express from 'express';

const PORT = process.env.PORT || 3300;
const api = express();



api.listen(PORT, () => {
	console.log(`API running on port: ${PORT}`);
})