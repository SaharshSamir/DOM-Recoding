import express from 'express';
import cors from 'cors';
import fs from "fs/promises";
import { diff_match_patch } from 'diff-match-patch';
import path from 'path';

const dmp = new diff_match_patch();
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Set limit to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/', (_req, res) => {
  console.log('Hello World!');
  res.json({ message: 'Hello World!' });
});

let previousDomState = "";

app.post('/', async (req, res) => {
  console.log('recieved request');
  try {
    const snapshotsDirPath = path.join(process.cwd(), 'snapshots');
    await fs.mkdir(snapshotsDirPath, { recursive: true });

    //store the original state of the dom
    if (req.body.type === 'original-state') {
      previousDomState = req.body.data;
      await fs.writeFile(path.join(snapshotsDirPath, 'original-state.html'), req.body.data, 'utf8');
    }

    //store subsequent changes to the dom. We get patches, that we can apply to the last stored DOM state
    if (req.body.type === 'patch') {
      const patch_list = dmp.patch_fromText(req.body.data);

      if (!patch_list.length) {
        console.log('no patches found, ignoring');
        return res.status(400).json({ message: "no patches were found" });
      }

      const [updated_dom, appliedPatches] = dmp.patch_apply(patch_list, previousDomState);

      console.log('patches appllied successfully', appliedPatches, JSON.stringify(patch_list, null, 2));

      previousDomState = updated_dom;
      console.log('writing to file');
      const sanitizedDom = updated_dom.replace(/<script.*?>.*?<\/script>/g, '');
      await fs.writeFile(path.join(snapshotsDirPath, `snapshot-${Date.now()}.html`), sanitizedDom, 'utf8');
    }

    res.json({ message: `Recieved ${req.body.type}` });
  } catch (err) {
    console.log(err);
    res.json({ message: err });
  }
})

app.listen(1212, () => {
  console.log(`Example app listening on port 1212!`);
});

