// An index file to gather the API routes and export them for use
const router = require('express').Router();
const userRoutes = require('./user-routes');                        // <= User Routes.
const postRoutes = require('./post-routes');                        // <= Post Routes.
const commentRoutes = require('./comment-routes');                  // <= Comment Routes.
router.use('/api/user_routes.js', userRoutes);                      // <= Defined route paths for the API to use.
router.use('/api/post_routes.js', postRoutes);
router.use('/api/comment_route.js', commentRoutes);
module.exports = router;                                            // <= Export the router.