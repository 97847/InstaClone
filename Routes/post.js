const express = require('express');
const user_route = express.Router();
const Post=require('../Modules/post');
const User = require('../Modules/user');
const requireLogin=require('../middleware/middware');


//getting all post created by authetic user by ascending order of creation time
user_route.get('/allposts', (req, res) => {
  Post.find()
    .sort({ createdTime: 'desc' })
    .populate({
      path: 'comments',
      populate: {
        path: 'postedBy',
        select: 'username',
      },
    })
    .populate({
      path: 'likes',
      select: 'username',
    })
    .select('title desc createdTime comments likes')
    .then(posts => {
      const formattedPosts = posts.map(post => ({
        id: post._id,
        title: post.title,
        desc: post.desc,
        created_at: post.createdTime,
        comments: post.comments,
        likes: post.likes.length,
      }));
      res.json(formattedPosts);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'Error fetching posts' });
    });
});

  
//creating a post 
user_route.post('/post', (req, res) => {
  const { title, desc } = req.body;
  if (!title || !desc) {
    res.status(422).json({ error: "Please add all fields" });
  }

  console.log(req.user);

  const post = new Post({
    title,
    desc,
    postedBy: req.user,
  });

  post.save().then((result) => {
    res.json({
      postId: result._id,
      title: result.title,
      desc: result.desc,
      createdAt: result.createdAt,
    });
  }).catch((err) => {
    console.log(err);
  });
});


//get post by using user id
// user_route.get('/posts/:id',requireLogin, (req, res) => {
//     const postId = req.params.id;
    
//     Post.findById(postId)
//       .then(posts => {
//         if (!posts) {
//           return res.status(404).json({ message: 'Post not found' });
//         }
//         res.json(posts);
//       })
//       .catch(err => {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//       });
//   });
  // add followers for with given userid



// POST /api/follow/{id}
// Follow a user with the given ID


// POST /api/follow/{id} - Follow a user with the specified ID
user_route.post('/follow/:id', requireLogin, async (req, res) => {
  try {
    // Find the user to follow
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Get the authenticated user's ID
    const userId = req.user.id;

    // Check if the authenticated user is already following the user to follow
    if (userToFollow.followers.includes(userId)) {
      return res.status(400).json({ msg: 'User already followed' });
    }

    // Add the authenticated user's ID to the user to follow's followers array
    userToFollow.followers.push(userId);
    await userToFollow.save();

    // Add the user to follow's ID to the authenticated user's following array
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (user.following.includes(userToFollow.id)) {
      return res.status(400).json({ msg: 'User already followed' });
    }
    user.following.push(userToFollow.id);
    await user.save();

    res.json({ msg: 'User followed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// UnFollow a user with the given ID


// POST /api/unfollow/{id} - unfollow a user with {id}
// POST /api/unfollow/:id
user_route.post('/unfollow/:id', requireLogin, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      const userToUnfollow = await User.findById(req.params.id);
  
      if (!userToUnfollow) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // Check if the user is already not following the userToUnfollow
      if (!user.following.includes(userToUnfollow.id)) {
        return res.status(400).json({ msg: 'You are not following this user' });
      }
  
      // Remove the userToUnfollow from the user's following array
      const followingIndex = user.following.indexOf(userToUnfollow.id);
      user.following.splice(followingIndex, 1);
  
      // Remove the user from the userToUnfollow's followers array
      const followerIndex = userToUnfollow.followers.indexOf(user.id);
      userToUnfollow.followers.splice(followerIndex, 1);
  
      await user.save();
      await userToUnfollow.save();
  
      res.json({ msg: 'Unfollowed successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  //get total followers and foloowing


// GET /api/user
user_route.get('/user',requireLogin, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const { email, followers, following } = user;
    res.json({email , followers: followers.length, following: following.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//addinng likes functionalite


// POST /api/like/:id
user_route.post('/like/:id',requireLogin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    post.likes.push(req.user._id);
    await post.save();
    res.json(post.toJSON());
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//unlike post api


// POST /api/unlike/:id
user_route.post('/unlike/:id', requireLogin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    post.likes.pull(req.user._id);
    await post.save();
    res.json(post.toJSON());
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//comments on post with given id

user_route.post('/comment/:id',requireLogin, async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;
    const post = await Post.findById(postId);
    console.log(post);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const newComment = {
      text,
      postedBy: req.user._id,
    };
    post.comments.unshift(newComment);
    await post.save();
    res.status(201).json({ commentId: post.comments[0]._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// count number of like and comment


user_route.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('postedBy', '_id name')
      .populate('comments', '_id')
      .populate('likes', '_id');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const numLikes = post.likes.length;
    const numComments = post.comments.length;

    res.json({
      _id: post._id,
      numLikes,
      numComments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
//delete post
user_route.delete('/posts/:id', requireLogin, async (req, res) => {
  try {
    const post = await Post.findOne({_id: req.params.id, postedBy: req.user._id});
console.log(req.params.id);
console.log(req.user._id);
console.log(post);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
















  
module.exports= user_route;
