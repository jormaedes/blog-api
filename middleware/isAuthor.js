function isAuthor(req, res, next) {
  if (req.user.userType !== 'AUTHOR') return res.status(403).json({ message: 'Forbidden' });
  next();
}

export default isAuthor;