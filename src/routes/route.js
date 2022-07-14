const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
const bookController = require("../controller/bookController")
const reviewController = require("../controller/reviewController")
const {authentication, authorisation} = require ("../middleware/middleware")

                        // <-----------USER API----------------->
router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)

                        // <----------BOOK API--------------->
router.post("/books", authentication, authorisation, bookController.createBook)
router.get("/books",authentication, bookController.getBooks)
router.get("/books/:bookId", authentication, bookController.getBooksById)
router.put("/books/:bookId", authentication, authorisation, bookController.updateBook)
router.delete("/books/:bookId", authentication, authorisation, bookController.deleteBook)

                         // <-----------REVIEW API----------------->
router.post("/books/:bookId/review", reviewController.createReview)
router.put("/books/:bookId/review/:reviewId",  reviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId",  reviewController.deleteReview)
                        // <-----------No Page Found----------------->
router.all('*', (req, res) => {res.status(404).send({status : false, message:"No Page Found !!"})})

module.exports=router