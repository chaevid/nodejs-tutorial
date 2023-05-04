const fs = require('fs');
const path = require('path');
const util = require('util');
const { exec } = require('child_process');
const execPromise = util.promisify(exec);

const fbx2gltfExecutable = path.join(
  __dirname,
  'node_modules',
  'fbx2gltf',
  'bin',
  process.platform === 'win32'
    ? 'Windows'
    : process.platform === 'darwin'
    ? 'Darwin'
    : 'Linux',
  process.platform === 'win32' ? 'FBX2glTF.exe' : 'FBX2glTF'
);
async function convertFBXtoGLTF(fbxPath) {
  const outputFolder = fbxPath + '_out';
  const outputGltfName = path.basename(fbxPath, '.fbx') + '.gltf';
  const outputGltfPath = path.join(outputFolder, outputGltfName);
  const command = `${fbx2gltfExecutable} -i "${fbxPath}" -o "${outputGltfPath}"`;

  try {
    await execPromise(command);

    if (!fs.existsSync(outputGltfPath)) {
      throw new Error(`Output file not found: ${outputGltfPath}`);
    }

    fs.unlinkSync(fbxPath);
    return { outputFolder, outputGltfPath };
  } catch (error) {
    throw new Error(`Conversion failed: ${error.message}`);
  }
}
module.exports = { convertFBXtoGLTF };
