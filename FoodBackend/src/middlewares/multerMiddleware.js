import multer from "multer";
import path from "path"
const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
      cb(null,'./FoodBackend/public/images');
  },
  filename:(req,file,cb)=>{
      const name=Date.now()+'-'+file.originalname;
      cb(null,name);
  }
})

export const upload=multer({storage:storage, fileFilter: (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only images are allowed!'), false);
  }
  cb(null, true);
  }
})
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './FoodBackend/public/images')
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.originalname)
//     }
//   })
  
// export const upload = multer({ storage: storage })