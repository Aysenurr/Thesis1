# Progressive Images in Web

Some approaches for progressive images. 

## Contents

- [Installation](#installation)
- [Run server](#run-server)
- [Upload images](#upload-images)
- [View images](#view-images)
- [Used packages](#used-packages)

### Installation
Prerequirements: installed nodejs and npm (https://nodejs.org/en/)  

Clone repo: 
```sh
git clone https://github.com/Aysenurr/Thesis1.git
cd Thesis1
```

Install the dependencies:
```sh
npm install
```

### Run server
To run server:  
```sh
node server.js
```

### Upload images
To upload and delete images use form: http://localhost:8080/admin 

### View images
To view images: http://localhost:8080/view_thumbnails and http://localhost:8080/view_progressive  

### Used packages
- ```express``` to implement basical server  
- ```express-fileupload``` to implement upload functionality  
- ```sharp``` to convert uploaded images to progressive jpeg and to create thumbnails  
- ```progressive-image``` to load thumbnails before original images  

