import * as fs from 'fs';
import * as path from 'path';

export function readTextFile(file_path : string)
{
    try {
        return fs.readFileSync(path.join(__dirname, file_path), 'utf8')
    } catch (e) {
        console.log('Error leyendo archivo local: '+file_path);
        return undefined
    }
}
export function writeTextFile(file_path : string, file: string)
{
    try {
        return fs.writeFileSync(path.join(__dirname, file_path), file)
    } catch (e) {
        console.log('Error escribiendo archivo local: '+file_path);
        return undefined
    }
}