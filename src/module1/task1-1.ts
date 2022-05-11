import process from 'process';

process.stdin.on('data', (data) => {
  process.stdout.write(`${data.toString().split('').reverse().join('')}\n`);
});
