import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? process.env.ComSpec || 'cmd.exe' : 'npm';
const commands = ['dev:main', 'dev:driver', 'dev:customer'];
const children = [];
let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(exitCode), 150);
}

for (const command of commands) {
  const args = isWindows ? ['/d', '/s', '/c', `npm.cmd run ${command}`] : ['run', command];
  const child = spawn(npmCommand, args, {
    stdio: 'inherit',
    env: process.env,
    windowsHide: false,
  });
  children.push(child);
  child.on('error', (error) => {
    console.error(`[${command}] ${error.message}`);
    shutdown(1);
  });
  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    if (signal) {
      console.error(`[${command}] stopped by ${signal}`);
      shutdown(1);
      return;
    }
    if (code !== 0) {
      console.error(`[${command}] exited with code ${code}`);
      shutdown(code || 1);
    }
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
