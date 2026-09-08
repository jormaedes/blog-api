import express from 'express';
import { validateSignup, handleValidationErrors } from './middleware/validation.js';


const PORT = process.env.PORT || 3300;
const api = express();

api.use(express.json());

api.post('/signup', validateSignup, handleValidationErrors, (req, res)=>{
	const { firstname, lastname, username, password } = req.body;
	console.log(req.body);
	return res.json(req.body);
})

api.listen(PORT, () => {
	console.log(`API running on port: ${PORT}`);
})