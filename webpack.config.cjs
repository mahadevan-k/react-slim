const path = require('path');

module.exports = {
  entry: './react-slim.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'react-slim.js',
    globalObject: 'this',
    library: {
      name: 'react_slim',
      type: 'umd',
    },
  },
   externals: {
     lodash: {
       commonjs: 'lodash',
       commonjs2: 'lodash',
       amd: 'lodash',
       root: '_',
     },
   }
};
