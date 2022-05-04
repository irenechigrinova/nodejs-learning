import process from 'process';

process.stdin.on('data', data => {
    console.log(data.toString().split('').reverse().join(''));
})