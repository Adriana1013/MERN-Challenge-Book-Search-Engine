const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
      return userData;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
},

Mutation: {
  login: async (parent, { email, password }) => {
    const user = await User.findOne({ email });  

    if (!user) {
        throw new AuthenticationError('Invalid Entry');
      }

      const correctPassword = await user.isCorrectPassword(password);

      if (!correctPassword) {
        throw new AuthenticationError('Invalid Entry');
      }

      const token = signToken(user);

      return { token, user };
    },

    addUser: async (parent, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      },

    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true },
        );
          return updatedUser;
      }
      throw new AuthenticationError('Must be logged in!')
    },

    removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId: bookId } } },
            { new: true },
          );
          return updatedUser;
        }
        throw new AuthenticationError('Must be logged in!')
      } 
    }
  };

module.exports = resolvers;