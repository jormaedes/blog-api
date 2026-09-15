import jwt from 'jsonwebtoken';

function optionalAuth(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader?.split(' ')[1];
	if (!token) return next();

	jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
		if (!error) req.user = decoded;
		next();
	});
}

export default optionalAuth;