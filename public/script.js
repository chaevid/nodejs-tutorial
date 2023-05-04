document
  .getElementById('upload-form')
  .addEventListener('submit', async (event) => {
    event.preventDefault();
    const fileInput = document.getElementById('fbx');
    const file = fileInput.files[0];

    if (!file) {
      alert('Please select a file.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('fbx', file);

      const response = await fetch('/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert('Error: ' + errorText);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace('.fbx', '.gltf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });
