import {execSync} from 'child_process'
import {existsSync, readFileSync} from 'fs'
import {performance} from 'perf_hooks'
import * as process from 'process'

const PACKAGE_JSON = 'package.json'

let script = process.argv[2]
if (!script)
    throw new Error('No script specified')

if (!existsSync(PACKAGE_JSON))
    throw new Error(`${PACKAGE_JSON} does not exist`)

const startTime = performance.now()

let packageJson: Record<string, any> = JSON.parse(readFileSync(PACKAGE_JSON).toString())

let scripts = packageJson['scripts']

if (!scripts)
    throw new Error(`${PACKAGE_JSON} does not have a scripts property`)

const scriptReg = new RegExp(`^${script.replace('*','.*')}$`)

/**
 * 转换（耗时）时间（到字符串）
 * @param time 时间
 */
export function convertTime(time: number): string {
    let ms = Math.round(time % 1000)
    time = Math.floor(time / 1000)
    let s = time % 60
    time = Math.floor(time / 60)
    return time === 0 ? `${s}.${ms}s` : `${time}m${s}.${ms}s`
}

let runCount = 0
Object.keys(scripts).forEach(name => {
    if (scriptReg.test(name)) {
        runCount++
        let cmd = scripts[name]
        let st = performance.now()
        try {
            console.log(`Running ${name}\n`)
            execSync(cmd, {stdio: 'inherit'})
        } catch (e) {
            console.error(e)
            process.exit(1)
        } finally {
            console.log('took ' + convertTime(performance.now() - st) + '\n')
        }
    }
})

if (runCount === 0)
    throw new Error(`No script found matching ${script}`)

console.log(runCount + ' tasks, ' + 'took ' + convertTime(performance.now() - startTime) + '\n')
