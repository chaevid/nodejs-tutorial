const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const obj2gltf = require('obj2gltf');
const fbx2gltf = require('fbx2gltf');
const { convertDaeToGltf } = require('collada2gltf');
const { NodeIO } = require('@gltf-transform/core');
const { KHR_draco_mesh_compression } = require('@gltf-transform/extensions');
const { dedup, mergeBuffers, partition } = require('@gltf-transform/functions');
const { spawn } = require('child_process');

const app = express();
const port = 3000;

async function convertFile(inputFile, outputFile) {
  const fileExtension = inputFile.split('.').pop().toLowerCase();

  let converter;
  if (fileExtension === 'fbx') {
    converter = 'fbx2gltf';
  } else if (fileExtension === 'dae') {
    converter = 'COLLADA2GLTF';
  } else if (fileExtension === 'obj') {
    converter = 'obj2gltf';
  } else {
    throw new Error(`Unsupported file format: ${fileExtension}`);
  }

  return new Promise((resolve, reject) => {
    const conversionProcess = spawn(converter, [
      '-i',
      inputFile,
      '-o',
      outputFile,
    ]);

    conversionProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    conversionProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Conversion process exited with code ${code}`));
      }
    });
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/convert', upload.single('modelFile'), async (req, res) => {
  try {
    // 파일이 업로드되지 않았을 때 처리
    if (!req.file) {
      res.status(400).send('No file uploaded');
      return;
    }

    // 파일 변환 작업을 수행하고 결과를 반환합니다.
    const inputFile = req.file.path;
    const outputFile = `${inputFile}.gltf`;

    await convertFile(inputFile, outputFile); // 이 함수는 파일 형식에 따라 적절한 변환 도구를 호출해야 합니다.

    res.download(outputFile, (err) => {
      if (err) {
        console.error(`Error sending file: ${err.message}`);
      }

      // 파일 전송이 완료되면 임시 파일을 삭제합니다.
      fs.unlink(inputFile, (err) => {
        if (err) console.error(`Error deleting input file: ${err.message}`);
      });
      fs.unlink(outputFile, (err) => {
        if (err) console.error(`Error deleting output file: ${err.message}`);
      });
    });
  } catch (err) {
    console.error(`Error converting file: ${err.message}`);
    res.status(500).send(err.message);
  }
});

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

if (!fs.existsSync('./converted')) {
  fs.mkdirSync('./converted');
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
