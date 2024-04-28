import {execSync} from 'child_process'
import {existsSync, readFileSync} from 'fs'
import {convertTime} from './utils'

type PackageJson = Record<string, any> & {
    scripts?: Record<string, string>
}

const PACKAGE_JSON = 'package.json'

function checkPackageJson() {
    if (!existsSync(PACKAGE_JSON))
        throw new Error(`${PACKAGE_JSON} does not exist`)
}

function getPackageJson(): PackageJson {
    return JSON.parse(readFileSync(PACKAGE_JSON).toString())
}

function runScript(packagesJson: PackageJson, script: string) {
    const scripts = packagesJson.scripts!
    const scriptReg = new RegExp(`^${script.replace('*','.*')}$`)
    let runCount = 0
    try {
        Object.keys(packagesJson.scripts!).forEach(name => {
            if (scriptReg.test(name)) {
                runCount++
                let cmd = scripts[name]
                let st = performance.now()
                try {
                    console.log(`Running ${name}\n`)
                    execSync(cmd, {stdio: 'inherit'})
                } finally {
                    console.log('took ' + convertTime(performance.now() - st) + '\n')
                }
            }
        })
    } catch (e) {
        console.error(e)
    }
    if (runCount === 0)
        console.warn(`No script matched ${script}`)
    return runCount
}

export function runPkgScripts(scripts: string[]) {
    if (scripts.length === 0)
        throw 'at least one script should be provided'

    const st = performance.now()
    checkPackageJson()
    const json = getPackageJson()
    if (!json.scripts)
        throw 'package.json does not have a scripts property'

    let successCount = 0
    for (const script of scripts) {
        successCount += runScript(json, script)
    }
    if (successCount === 0)
        console.warn('No script ran')
    console.log(successCount + ' tasks, ' + 'took ' + convertTime(performance.now() - st))
}
