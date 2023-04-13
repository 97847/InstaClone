const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const CommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  postedBy: {
    type: ObjectId,
    ref: 'User',
  },
  createdTime: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  postedBy: {
    type: ObjectId,
    ref: 'User',
  },
  createdTime: {
    type: Date,
    default: Date.now,
    required: true,
  },
  likes: [
    {
      type: ObjectId,
      ref: 'User',
    },
  ],
  comments: [CommentSchema],
});

module.exports = mongoose.model('Post', PostSchema);
