const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment } = require('../models');


router.get('/', (req, res) => {                                                           // <= Renders the home page.
    Post.findAll({
        
        attributes: [                                                                     // <= From the Post table, include the post ID, URL, title, and the timestamp from post creation.
            'id',
            'post_text',
            'title',
            'created_at',
          ],
         order: [[ 'created_at', 'DESC']],                                                // <= Placing the posts from most recent to least.
        
        include: [
            {
                model: User,
                attributes: ['username']                                                  // <= From the User table, include the post creator's user name.
            },
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],   // <= From the Comment table, include all comments.
                include: {
                    model: User,
                    attributes: ['username']
                }
            }
        ]
    })
   
    .then(dbPostData => {                                                                 // <= Renders the posts.
      
      const posts = dbPostData.map(post => post.get({ plain: true }));                    // <= Creates an array for the posts, using the get method to trim extra sequelize object data out.
     
      res.render('homepage', {                                                            // <= Passes the posts into the homepage template.
        posts,
        loggedIn: req.session.loggedIn
      });
    })
    
    .catch(err => {                                                                      // <= If there was a server error, return the error.
        console.log(err);
        res.status(500).json(err);
    });
});


router.get('/post/:id', (req, res) => {                                                  // <= Renders the single post page.
    Post.findOne({
      where: {
       
        id: req.params.id                                                                // <= Specifying the post id parameter in the query.
      },
      
      attributes: [                                                                      // <= Query configuration, as with the get all posts route.
        'id',
        'post_text',
        'title',
        'created_at',
      ],
      include: [
        {
          model: User,
          attributes: ['username']
        },
        {
            model: Comment,
            attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
            include: {
                model: User,
                attributes: ['username']
            }
        }
      ]
    })
      .then(dbPostData => {
        
        if (!dbPostData) {                                                               // <= If no post by that id exists, return an error.
          res.status(404).json({ message: 'No post found with this id' });
          return;
        }
        
        const post = dbPostData.get({ plain: true });                                   // <= Serializing the post data, removing extra sequelize meta data.
        
        res.render('single-post', {                                                     // <= Passes the posts and a session variable into the single post template.
            post,
            loggedIn: req.session.loggedIn
          });
      })
      .catch(err => {
        
        console.log(err);                                                               // <= If a server error occured, returns an error.
        res.status(500).json(err);
      });
  });

router.get('/login', (req, res) => {                                                    // <= Renders the login page.  If the user is logged in, redirect to the home page.
    if (req.session.loggedIn) {
      res.redirect('/');
      return;
    }
  
    res.render('login');
  });


router.get('/signup', (req, res) => {                                                   // <= Renders the sign up page.  If the user is logged in, redirect to the home page.
  if (req.session.loggedIn) {
    res.redirect('/');
    return;
  }

  res.render('signup');
});

module.exports = router;