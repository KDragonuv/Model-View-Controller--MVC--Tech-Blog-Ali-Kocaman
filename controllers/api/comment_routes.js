const router = require('express').Router();         // Express.js connection.
const { Comment } = require('../../models');        // <= Comment model.
const withAuth = require('../../utils/auth');       // <= Authorization Helper.

router.get('/', (req, res) => {                     // <= To get comments.

    Comment.findAll()                                      // Access to the Comment model and run .findAll() method to get all comments.

      .then(dbCommentData => res.json(dbCommentData))      // <= Returns the data as JSON formatted.
      
      .catch(err => {                                      // <= If there is a server error, return that error.
        console.log(err);
        res.status(500).json(err);
      });
  });

router.post('/', withAuth, (req, res) => {                 // <= To allow user to post a new comment.
  
  if (req.session) {                                       // <= Check the session, and if it exists, create a comment.
    Comment.create({
      comment_text: req.body.comment_text,
      post_id: req.body.post_id,
      user_id: req.session.user_id                         // <= Uses the user id from the session to authenticate.
    })
      .then(dbCommentData => res.json(dbCommentData))
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  }
});

router.delete('/:id', withAuth, (req, res) => {            // <= To delete specific comments.
    Comment.destroy({
        where: {
          id: req.params.id
        }
      })
        .then(dbCommentData => {
          if (!dbCommentData) {
            res.status(404).json({ message: 'No comment found with this id' });
            return;
          }
          res.json(dbCommentData);
        })
        .catch(err => {
          console.log(err);
          res.status(500).json(err);
        });
    });

module.exports = router;