const fs = require('fs');
const path = require('path');

class sassAutoIndex {
  fileNames = [];
  childrenDirPath = [];

  constructor () {}

  readTarget = (targetPath) => {
    fs.readdir(targetPath, {withFileTypes: true}, (err, children) => {
      if (err) {
        console.error('This Directory is undifind.');
        return;
      }
  
      if (!children.length) {
        console.log('some empty directory exists.');
        return;
      } 
  
      for (const child of children) {
  
        if (child.isFile() && targetPath !== process.argv[2] ) {
          let filename = child.name.toLowerCase();
          if( (filename.match(/^_.*\.(scss)$/) || filename.match(/^_.*\.(sass)$/)) && filename !== '_index.scss' ){
              this.fileNames.push(filename.slice(1, -5));
          }
        } else if (child.isDirectory()) {
          const childDirPath = path.join(targetPath, child.name);
          this.childrenDirPath.push(childDirPath);
  
          const inDir = fs.readdirSync(childDirPath);
          if (targetPath !== process.argv[2] && inDir.length ) {
            let isSass = false;
            for( const inDirFilename of inDir ){
              if( (inDirFilename.match(/^_.*\.(scss)$/) || inDirFilename.match(/^_.*\.(sass)$/)) && inDirFilename !== '_index.scss' ){
                isSass = true;
                break;
              }
            }
            if(isSass) {
              this.fileNames.push(child.name);
            } else {
              console.log('There is no sass in some directory.');
            }
          }
        }
      }
  
      // fileNames to makeIndex 
      if (this.fileNames.length) {
          this.makeIndex(this.fileNames, targetPath);
          this.fileNames = [];
      }
  
      // Underlayer to readTerget()
      if (this.childrenDirPath.length) {
        for(const childDirPath of this.childrenDirPath) {
            this.readTarget(childDirPath);
        }
        this.childrenDirPath = [];
      }
      return;
    });
  }

  makeIndex = (fileNames, dirPath) => {
    const forwardName = [];
    for(const fileName of fileNames) {
      forwardName.push(`@include "${fileName}";`);
    }
    const str = forwardName.join('\n');
    fs.writeFile(`${dirPath}/_index.scss`, str, (err) => {
      if(err) {
        console.log(err);
      }
    });
  }
}

const sai = new sassAutoIndex();
module.exports = sai;
