import csv from 'csvtojson';
import fs from 'fs';

const rs = fs.createReadStream('./src/module1/csv/Book1.csv');
const ws = fs.createWriteStream('./src/module1/results/task2.txt');

const handleError = (e: Error) => console.error(e);

const handleComplete = () => console.log("Complete");

csv()
    .fromStream(rs)
    .subscribe(json => {
        return new Promise((resolve, reject) => {
            try {
                const formatted = Object.keys(json).reduce((result, item) => {
                    const key = item.toLowerCase();
                    if (key !== "amount") {
                        return {
                            ...result,
                            [key]: json[item],
                        };
                    }
                    return result;
                }, {});

                ws.write(`${JSON.stringify(formatted)}\n`);
                resolve();
            } catch (e) {
                handleError(e as Error);
                reject(e);
            }
        });
    })
    .then(() => handleComplete())
