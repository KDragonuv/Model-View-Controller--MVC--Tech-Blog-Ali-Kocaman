// An index file to gather the routes to export to the server
const router = require('express').Router();                                         
const apiRoutes = require('./api');                                     // <= API routes folder.            
const homeRoutes = require('./home-routes.js');                         // <= Homepage routes.
const dashboardRoutes = require('./dashboard-routes.js');               // <= Dashboard Routes.
router.use('/api', apiRoutes);                                          // <= Defined the path for the server for the API routes.
router.use('/', homeRoutes);                                            // <= Defined the path for the home page.
router.use('/dashboard', dashboardRoutes);                              // <= Defined the path for the dashboard.

router.use((req, res) => {                                              // <= Defined a catch-all route for any resource that doesn't exist.
  res.status(404).end();
});

module.exports = router;