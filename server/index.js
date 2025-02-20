import express from 'express';
import cors from 'cors';
import fs from "fs/promises";
import dmp from 'diff-match-patch';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Set limit to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.get('/', (_req, res) => {
  console.log('Hello World!');
  res.json({ message: 'Hello World!' });
});

let previousDomState = "";

app.post('/', async (req, res) => {
  try {
    console.log(req.body.type);
    const snapshotsDirPath = path.join(process.cwd(), 'snapshots');
    await fs.mkdir(snapshotsDirPath, { recursive: true });

    if (req.body.type === 'original-state') {
      previousDomState = req.body.data;
      await fs.writeFile(path.join(snapshotsDirPath, 'original-state.html'), req.body.data, 'utf8');
    }

    if (req.body.type === 'patch') {
      const updated_dom = dmp.patch_apply(dmp.patch_fromText(req.body.data), previousDomState);
      previousDomState = updated_dom;
      await fs.writeFile(path.join(snapshotsDirPath, `snapshot-${Date.now()}.html`), updated_dom, 'utf8');
    }

    res.json({ message: `Recieved ${req.body}` });
  } catch (err) {
    console.log(err);
    res.json({ message: err });
  }
})

app.listen(1212, () => {
  console.log(`Example app listening on port 1212!`);
});
