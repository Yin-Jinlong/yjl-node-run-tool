import {copyFileSync, existsSync, readFileSync, rmSync, writeFileSync} from 'fs'
import * as process from 'process'

import {rollup} from 'rollup'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

async function buildBin() {
    const build = await rollup({
        input: `index.ts`,
        external(id) {
            return /node_modules/.test(id)
        },
        plugins: [
            typescript({
                check: false,
                clean: true,
                tsconfigOverride: {
                    declaration: false,
                    emitDeclarationOnly: false
                }
            }),
            resolve(),
            commonjs(),
        ]
    })

    await build.write({
        format: 'esm',
        dir: `../../dist`,
        entryFileNames: '[name].mjs',
        chunkFileNames: '[name].mjs',
        sourcemap: false
    })
    await build.close()
}

async function run() {
    if (existsSync('../../dist')) {
        rmSync('../../dist', {
            recursive: true
        })
    }

    const packageJson = JSON.parse((readFileSync('package.json')).toString())
    packageJson.name = '@yin-jinlong/run'
    packageJson.version = readFileSync('VERSION').toString().trim()
    packageJson.bin = {}

    packageJson.bin['run'] = `./index.mjs`
    await buildBin()

    writeFileSync('../../dist/package.json', JSON.stringify(packageJson, null, 2))
    copyFileSync('../../README.md', '../../dist/README.md')
}

run().then().catch(e => {
    console.error(e)
    process.exit(1)
})
