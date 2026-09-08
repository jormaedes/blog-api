function isAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) return res.sendStatus(401);
    req.user = decoded;
    next();
  })
}

export default isAuth;