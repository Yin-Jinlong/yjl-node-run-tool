import {execSync} from 'child_process'
import * as process from 'process'

import {program} from 'commander'
import {runPkgScripts} from './scripts'
import {CmdArgs} from './type'
import {convertTime} from './utils'

const st = performance.now()

program.version('0.1.0', '-v, --version')
    .name('run')
    .usage('[options] <script...>')
    .option('-r, --run', 'run shell')
    .argument('<script...>', 'script name or shell')
    .action((scripts, flags: CmdArgs, cmd) => {
        if (flags.run)
            runShells(scripts)
        else
            runPkgScripts(scripts)
    })

function runShells(shells: string[]) {
    let successCount = 0
    const shellSt = performance.now()
    try {
        let st = performance.now()
        for (const shell of shells) {
            try {
                console.log('running ', shell, '\n')
                execSync(shell, {stdio: 'inherit'})
                successCount++
            } finally {
                console.log('took ', convertTime(performance.now() - st))
            }
        }
    } finally {
        console.log(`\n${successCount} ran, took`, convertTime(performance.now() - shellSt))
    }
}

try {
    program.parse(process.argv)
} finally {
    console.log('\nEnd of run, took', convertTime(performance.now() - st))
}
