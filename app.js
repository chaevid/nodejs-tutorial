//////

const express = require('express');
const multer = require('multer');
const { convertFBXtoGLTF } = require('./converter');
const rimraf = require('rimraf'); // Add this line to the top of the file to use the rimraf module

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/convert', upload.single('file'), async (req, res) => {
  try {
    const { outputFolder, outputGltfPath } = await convertFBXtoGLTF(
      req.file.path
    );
    res.download(outputGltfPath, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error downloading file.');
      } else {
        rimraf.sync(outputFolder);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
