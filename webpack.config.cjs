const path = require('path');

module.exports = {
  entry: './react-tiny.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'react-tiny.js',
    globalObject: 'this',
    library: {
      name: 'react_tiny',
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
