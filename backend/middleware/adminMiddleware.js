const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'CompanyAdmin') {
    return next();
  }

  return res.status(403).json({
    message: 'Access denied. Administrator privileges required.',
  });
};

module.exports = { adminOnly };