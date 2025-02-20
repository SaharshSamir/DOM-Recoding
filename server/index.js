import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Set limit to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.get('/', (_req, res) => {
  console.log('Hello World!');
  res.json({ message: 'Hello World!' });
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.json({ message: `Recieved ${req.body}` });
})

app.listen(1212, () => {
  console.log(`Example app listening on port 1212!`);
});
