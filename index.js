import express from 'express'
import mongoose from 'mongoose'
import { registerValidation } from './validations/auth.js'
import { loginValidation } from './validations/login.js'
import { postCreateValidation } from './validations/post.js'
import multer from 'multer'
import { UserController, PostController } from './controllers/index.js'
import { checkAuth, handleValidationErrors } from './utils/index.js'
mongoose
    .connect('mongodb+srv://admin:wwwwww@atlascluster.k6q0vpa.mongodb.net/blog?retryWrites=true&w=majority')
    .then(() => console.log('DB ok'))
    .catch(err => console.log('DB ERROR', err))

const app = express()

app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.listen(4444, (error) => {
    if (error) {
        return console.log(error)
    }
})

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads')
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

app.post('/auth/login',loginValidation, handleValidationErrors, UserController.login)

app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)

app.get('/auth/me', checkAuth, UserController.getMe)

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalName}`
    })
})

app.post('/posts', checkAuth, postCreateValidation , PostController.create)
app.get('/posts', PostController.getAll)
app.get('/posts/:id', PostController.getOne)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update)