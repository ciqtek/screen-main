import path from 'path'
import { babel } from '@rollup/plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript'

function joinPath(filename) {
  return path.join(__dirname, filename);
}

const plugins = [
  resolve({
    customResolveOptions: {
      moduleDirectory: 'node_modules'
    },
  }),
  typescript(),
  babel({
    babelrc: false,
    include: ['code/**/*.ts'],
    presets: [
      ['@babel/preset-env', {
        "modules": false,
      }]
    ],
    babelHelpers: 'runtime',
    plugins: [
      ["@babel/transform-runtime", {
        regenerator: true
      }]
    ],
    exclude: ["node_modules/**"],
    extensions: ['js', 'ts']
  }),
]
const config = [ {
  input: joinPath('code/index.ts'),
  output: [{
    format: 'cjs',
    file: 'lib/index.cjs',
    name: 'index.cjs',
  }],
  external:['electron'],
  plugins
}]


export default [...config]