const router = require('express').Router();                                         // <= Express.js connection.
const { User, Post, Comment } = require('../../models');                            // <= User, Post, Vote models.
const session = require('express-session');                                         // <= Express Session for the session data.
const withAuth = require('../../utils/auth');                                       // <= Authorization helper.
const SequelizeStore = require('connect-session-sequelize')(session.Store);         // <= Sequelizes the store to save the session so the user can remain logged in.

router.get('/', (req, res) => {                                         // <= Route to get 'all'.
    
    User.findAll({                                                      // <= Access the User model and run .findAll() method to get all users.
       
        attributes: { exclude: ['password'] }                           // <= When the data is sent back, this will exclude the password property.
    })
      
      .then(dbUserData => res.json(dbUserData))                         // <= Returns the data as JSON formatted.
      
      .catch(err => {                                                   // <= If there is a server error, the error will be returned.
        console.log(err);
        res.status(500).json(err);
      });
  });

router.get('/:id', (req, res) => {                                      // <= Gets a single user by id.
   
    User.findOne({                                                      // <= Access the User model and run the findOne() method to get a single user based on parameters
      
      attributes: { exclude: ['password'] },                            // <= When the data is sent back, this will exclude the password property.
      where: {
        
        id: req.params.id                                               // <= Uses id as the parameter for the request.
      },
      
      include: [                                                        // <= To include the posts the user has created, the posts the user has commented on, and the posts the user has upvoted.
        {
          model: Post,
          attributes: ['id', 'title', 'post_text', 'created_at']
        },
        {
            model: Comment,
            attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
            include: {
                model: Post,
                attributes: ['title']
            }
        }
      ]
    })
      .then(dbUserData => {
        if (!dbUserData) {
         
          res.status(404).json({ message: 'No user found with this id' });           // <= If no user is found, returns the error.
          return;
        }
        
        res.json(dbUserData);                                                        // <= Otherwise, returns the data for the requested user.
      })
      .catch(err => {
        
        console.log(err);                                                           // <= If there is a server error, returns the error.
        res.status(500).json(err);
      });
  });

router.post('/', (req, res) => {                                                    // <= POST /api/users -- add a new user
 
  User.create({                                                                     // <= Create methodexpects an object in the form {username: 'Ali', email: 'thisisnotalisemail@gmail.com', password: 'password1234'}.
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  })
    
    .then(dbUserData => {                                                           // <= Sends the user's data back to the client as confirmation and save the session.
      req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;
    
        res.json(dbUserData);
      });
    })
    
    .catch(err => {                                                                // <= If there is a server error, returns the error.
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/login',  (req, res) => {                                             // <= To post login route for the user.
    User.findOne({                                                                 // <= 'findOne' method by email to look for an existing user in the database with the email address entered.
        where: {
        email: req.body.email
        }
    }).then(dbUserData => {
       
        if (!dbUserData) {
        res.status(400).json({ message: 'No user with that email address!' });     // <= If the email is not found, return an error.
        return;
        }
       
        const validPassword = dbUserData.checkPassword(req.body.password);         // <= Call the instance method as defined in the User model.
        
        if (!validPassword) {                                                      // <= If the password is invalid (method returns false), error will be returned.
            res.status(400).json({ message: 'Incorrect password!' });
            return;
        }
        
        req.session.save(() => {                                                  // <= Otherwise, save the session, and returns the user object with a success message.
          
          req.session.user_id = dbUserData.id;                                    // <= Declared session variables.
          req.session.username = dbUserData.username;
          req.session.loggedIn = true;
    
          res.json({ user: dbUserData, message: 'You are now logged in!' });      // <= The success message.
        });
    });  
});

router.post('/logout', withAuth, (req, res) => {                                  // <= To log out an existing user.
  if (req.session.loggedIn) {
    req.session.destroy(() => {

      res.status(204).end();                                    // (personal notes) 204 status is a succeeded request, but client does not need to go to a different page.
                                                                // 200 indicates success that a newly updated page should be loaded, 201 is for a resource being created.
    });
  } else {
    res.status(404).end();                                                       // <= If there is no session, then the logout request will send back a no resource found status.
  }
})

router.put('/:id', withAuth, (req, res) => {                                    // <= If req.body has exact key/value pairs to match the model, 
                                                                                // <= You can just use `req.body` instead of calling out each property,
                                                                                // <= Allowing for updating only key/value pairs that are passed through
     User.update(req.body, {                                                    // <= since there is a hook to hash only the password, the option is noted here
        
        individualHooks: true,
        
        where: {
            id: req.params.id                                                   // <= Uses the id as the parameter for the individual users to be updated.
        }
    })
      .then(dbUserData => {
        if (!dbUserData[0]) {
          res.status(404).json({ message: 'No user found with this id' });
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  })


router.delete('/:id', withAuth, (req, res) => {                                 // To delete an existing user.
   
    User.destroy({                                                              // Destroy method.aaaaa
      where: {
        id: req.params.id
      }
    })
      .then(dbUserData => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with this id' });
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });

module.exports = router;
