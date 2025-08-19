import path from "path";
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  {
    mode: 'production',
    entry: './react-slim.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'react-slim.js',
      library: {
        type: 'module',
      },
    },
    experiments: {
      outputModule: true,
    },
    optimization: {
      minimize: false
    },
    target: ['web','es2020'], // or 'web' if targeting browser ESM
    resolve: {
      extensions: ['.js'],
    }
  },  
  {
    mode: 'production',
    entry: './react-slim.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'react-slim.min.js',
      library: {
        type: 'module',
      },
    },
    experiments: {
      outputModule: true,
    },
    target: ['web','es2020'], // or 'web' if targeting browser ESM
    resolve: {
      extensions: ['.js'],
    }
  }
];
