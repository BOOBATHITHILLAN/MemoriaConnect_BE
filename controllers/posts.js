import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: [],
      comments: [],
    });
    await newPost.save();

    const post = await Post.find();
    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find();
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE LIKES*/
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);


    if (post.likes.includes(userId)) {
      const updatedPost = await Post.findByIdAndUpdate(
        id,
        { likes: post.likes.filter(id => id !== userId) }
      );
      console.log(updatedPost)
      res.status(200).json(updatedPost);
    } else {
      const updatedPost = await Post.findByIdAndUpdate(
        id,
        { likes: [...post.likes, userId] }
      );
      console.log(updatedPost)
      res.status(200).json(updatedPost);
    }

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
/* UPDATE COMMENTS*/
export const commentPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const post = await Post.findById(id);

    if (post) {
      const updatedPost = await Post.findByIdAndUpdate(
        id,
        { comments: [...post.comments, comment] },
        { new: true }
      );
      return res.status(200).json(updatedPost);
    }

  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//Post and Users length for barChart
export const userPost=async(req,res)=>{
  try {
    const users=await User.find();
    const posts=await Post.find();  
    const userLength=users.length  
    const postLength=posts.length
    res.status(200).json({userLength,postLength})
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}