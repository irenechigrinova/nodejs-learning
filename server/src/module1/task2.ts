import fs from 'fs';
import csv from 'csvtojson';
import { Transform, TransformCallback, pipeline } from 'stream';

const rs = fs.createReadStream('./src/module1/csv/Book1.csv');
const ws = fs.createWriteStream('./src/module1/results/task2.txt');

/* const handleError = (e: Error) => console.error(e);

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
    .then(() => handleComplete()) */

class CustomTransform extends Transform {
  // eslint-disable-next-line no-underscore-dangle
  _transform(chunk: any, encoding: string, callback: TransformCallback) {
    try {
      const chunkObject = JSON.parse(chunk.toString());
      const formatted = Object.keys(chunkObject).reduce((result, item) => {
        const key = item.toLowerCase();
        if (key !== 'amount') {
          return {
            ...result,
            [key]: chunkObject[item],
          };
        }
        return result;
      }, {});

      callback(null, `${JSON.stringify(formatted)}\n`);
    } catch (e) {
      callback(e as Error);
    }
  }
}

/* rs.pipe(csv())
  .on('error', (e) => console.error('Read file error: ', e))
  .pipe(new CustomTransform())
  .on('error', (e) => console.error('Transform error: ', e))
  .pipe(ws)
  .on('error', (e) => {
    console.error('Write file error: ', e);
    process.exit();
  })
  .on('finish', () => {
    console.log('Write file succeeded');
    process.exit();
  }); */

const transform = new CustomTransform();
pipeline(csv().fromStream(rs), transform, ws, (err) => {
  if (err) {
    console.error('Pipeline failed.', err);
  } else {
    console.log('Pipeline succeeded.');
  }
});
