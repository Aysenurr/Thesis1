const express = require('express');
const fileUpload = require('express-fileupload');
const sharp = require('sharp');
const fs = require('fs');

['uploads', 'progressive', 'thumbnails'].forEach((folderName) => {
  const folderPath = `${__dirname}/${folderName}`;
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
})

const app = express();

app.use('/admin', express.static(__dirname + '/admin.html'));
app.use('/view_thumbnails', express.static(__dirname + '/view_thumbnails.html'));
app.use('/view_progressive', express.static(__dirname + '/view_progressive.html'));

app.use('/progressive-image', express.static(__dirname + '/node_modules/progressive-image/dist'));

app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/thumbnails', express.static(__dirname + '/thumbnails'));
app.use('/progressive', express.static(__dirname + '/progressive'));

app.use('/css', express.static(__dirname + '/css'));

// default options
app.use(fileUpload());

app.get('/ping', function (req, res) {
  res.send('pong');
});

app.get('/delete/:image_name', function (req, res) {
  // res.send('image to delete' + req.params.image_name);
  fs.unlinkSync(`${__dirname}/uploads/${req.params.image_name}`);
  fs.unlinkSync(`${__dirname}/progressive/${req.params.image_name}.jpeg`);
  fs.unlinkSync(`${__dirname}/thumbnails/${req.params.image_name}.jpeg`);
  res.redirect("/form");
});

app.get('/image/:image_name', function (req, res) {
  res.send(`get image: ${req.params.image_name}`);
  console.log(req.query);
  console.log(req.params);
});

app.get('/images', (req, res) => {
  const imagesFolder = __dirname + '/uploads/';
  const files = fs.readdirSync(imagesFolder);
  files.sort(function (a, b) {
    return fs.statSync(imagesFolder + b).mtime.getTime() -
      fs.statSync(imagesFolder + a).mtime.getTime();
  });
  res.send(JSON.stringify(files));
});

app.post('/upload', async function (req, res) {
  let sampleFile;
  let uploadPath;

  if (Object.keys(req.files).length == 0) {
    res.status(400).send('No files were uploaded.');
    return;
  }

  console.log('req.files >>>', req.files); // eslint-disable-line

  sampleFile = req.files.sampleFile;

  await sharp(req.files.sampleFile.data)
    .jpeg({
      progressive: true,
      quality: 100,
    })
    .toFile(__dirname + '/progressive/' + sampleFile.name + '.jpeg');

  await sharp(req.files.sampleFile.data)
    .jpeg({
      quality: 5,
    })
    .toFile(__dirname + '/thumbnails/' + sampleFile.name + '.jpeg');

  uploadPath = __dirname + '/uploads/' + sampleFile.name;

  sampleFile.mv(uploadPath, function (err) {
    if (err) {
      return res.status(500).send(err);
    }

    // res.send('File uploaded to ' + uploadPath);
    res.redirect("/form");
  });
});

const port = parseInt(process.env.PORT, 10) || 8080;

app.listen(port, function () {
  console.log(`my server listening on port ${port}`); // eslint-disable-line
});
