
const router = require('express').Router();
const sequelize = require('../config/connections');
const { Post, User, Comment } = require('../models');

const withAuth = require('../utils/auth');                      // <= Middleware to check if the user is authenticated.
router.get('/', withAuth, (req, res) => {
   
    Post.findAll({                                              // <= Find all posts for the logged-in user.
      where: {
        user_id: req.session.user_id
      },
      attributes: [
        'id',
        'post_text',
        'title',
        'created_at',
      ],
      include: [
        {
          model: Comment,
          attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
          include: {
            model: User,
            attributes: ['username']
          }
        },
        {
          model: User,
          attributes: ['username']
        }
      ]
    })
      .then(dbPostData => {
       
        const posts = dbPostData.map(post => post.get({ plain: true }));       // <= Extract plain data from the database response.       
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });

router.get('/edit/:id', withAuth, (req, res) => {                             // <= Route to get a specific post for editing.
  Post.findOne({                                                              // <= Find a post by ID, including associated comments and user information.
    where: {
      id: req.params.id
    },
    attributes: [
      'id',
      'post_text',
      'title',
      'created_at',
    ],
    include: [
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['username']
        }
      },
      {
        model: User,
        attributes: ['username']
      }
    ]
  })
    .then(dbPostData => {                                                              
      if (!dbPostData) {                                                                          // <= If no post is found, return a 404 response.
        res.status(404).json({ message: 'No post found with this id' });
        return;
      }
      const post = dbPostData.get({ plain: true });
      res.render('edit-post', { post, loggedIn: true });                                          // <= Render the 'edit-post' template with the post data.
    })
    .catch(err => {                                                                                
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/edituser', withAuth, (req, res) => {                                                 // <= Route to get the current user's information for editing.
  User.findOne({
    attributes: { exclude: ['password'] },                                                        // <= Find the current user's information, excluding the password.
    where: {
      id: req.session.user_id
    }
  })
    .then(dbUserData => {
      if (!dbUserData) {
        res.status(404).json({ message: 'No user found with this id' });
        return;
      }
      const user = dbUserData.get({ plain: true });
      res.render('edit-user', {user, loggedIn: true});
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    })
  });

module.exports = router;                                                                          // <= Export the router for use in other files.