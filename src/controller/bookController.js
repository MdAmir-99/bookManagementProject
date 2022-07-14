const bookModel = require("../model/bookModel");
const reviewModel = require("../model/reviewModel");
const validator = require("../validator/validator");
const mongoose = require("mongoose");
const {uploadFile} = require("../aws/awsFileUpload")

// CREATE BOOK
const createBook = async function (req, res) {
  try {
    let requestBody = req.body;
    let files = req.files
    // <----------Files in the Array format---------->
        if(files && files.length>0){
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL= await uploadFile( files[0] )
            requestBody['bookCover'] = uploadedFileURL;
        }
    let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } =
      requestBody;
    // <------------BODY VALIDATION----------------->
    if (!validator.isValidRequestBody(requestBody))
      return res
        .status(400)
        .send({
          status: false,
          message: "Invalid request parameters. Please provide user details",
        });

    // <--------------TITLE VALIDATION------------->
    if (!validator.isValidField(title))
      return res
        .status(400)
        .send({ status: false, message: "Book Title is required" });

    if (!validator.isValidBookTitle(title.trim()))
      return res
        .status(400)
        .send({ status: false, message: `The book title is not valid` });

    // <------------Check title is exist in db or not------------->
    let titleCheck = await bookModel.findOne({ title });
    if (titleCheck)
      return res
        .status(400)
        .send({ status: false, message: "Title should be unique" });

    // <-----------EXCERPT VALIDATION--------------->
    if (!validator.isValidField(excerpt))
      return res
        .status(400)
        .send({ status: false, message: "Excerpt is required" });

    if (!validator.isValidExcerpt(excerpt))
      return res
        .status(400)
        .send({ status: false, message: "Excerpt is in invalid format" });

    // <-----------USER ID VALIDATION------------>
    if (!validator.isValidField(userId))
      return res
        .status(400)
        .send({ status: false, message: "User id is required" });

    if (!validator.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: `${userId} is not a valid user id` });

    // <-----------------ISBN VALIDATION-------------->
    if (!validator.isValidField(ISBN))
      return res
        .status(400)
        .send({ status: false, message: " ISBN is required" });

    if (!validator.isValidISBN(ISBN))
      return res
        .status(400)
        .send({ status: false, message: " ISBN is not in valid format" });

    // <---------Check ISBN is exist in db or not------------->
    let ISBNCheck = await bookModel.findOne({ ISBN });
    if (ISBNCheck)
      return res
        .status(400)
        .send({ status: false, message: "ISBN already exist" });

    // <-----------CATEGORY VALIDATION------------>
    if (!validator.isValidField(category))
      return res
        .status(400)
        .send({ status: false, message: "Category is required" });

    // <--------------SUBCATEGORY VALIDATION-------------------->
    if (!validator.isValidField(subcategory))
      return res
        .status(400)
        .send({ status: false, message: "Subcategory is required" });

    // <-----------------RELEASED AT VALIDATION--------------->
    if (!validator.isValidField(releasedAt))
      return res
        .status(400)
        .send({ status: false, message: "ReleasedAt is required" });

    if (!validator.isReleasedAt(releasedAt))
      return res
        .status(400)
        .send({
          status: false,
          message: `${releasedAt} is not in valid format YYYY-MM-DD`,
        });

    // <-------------Create Book Doc---------------->

    let savedBook1 = await bookModel.create(requestBody);
    res.status(201).send({ status: true, data: savedBook1 });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

// GET BOOKS BY QUERY
const getBooks = async function (req, res) {
  try {
    let data = req.query;
    let { userId, category, subcategory } = data;
    // <----------Body Validation------------>
    if (!validator.isValidRequestBody(data)) {
      let bookData = await bookModel
        .find({ isDeleted: false })
        .select({
          _id: 1,
          title: 1,
          excerpt: 1,
          userId: 1,
          category: 1,
          releasedAt: 1,
          reviews: 1,
        })
        .sort({ title: 1 });
      return res
        .status(200)
        .send({ status: true, message: "Book List", data: bookData });
    }

    // <-----------userId validation-------------->
    if (userId) {
    
      if (!validator.isValidObjectId(userId))
        return res
          .status(400)
          .send({ status: false, message: "invalid userId" });
    }

    // <------------category validation------------->
    if (category) {
      if (!validator.isValidField(category))
        return res
          .status(400)
          .send({ status: false, message: "Category can't be empty !!" });
    }

    // <------------subCategory validation------------->
    if (subcategory) {
      if (!validator.isValidField(subcategory))
        return res
          .status(400)
          .send({ status: false, message: "subcategory can't be empty !!" });
    }

    let filter = { isDeleted: false, ...data };
    // <----------Check bookDocs are exist in db or not--------------->
    let findBook = await bookModel
      .find(filter)
      .select({
        _id: 1,
        title: 1,
        excerpt: 1,
        userId: 1,
        category: 1,
        releasedAt: 1,
        reviews: 1,
      })
      .sort({ title: 1 });
    if (findBook.length == 0)
      return res
        .status(404)
        .send({ status: false, message: "No Book found with given filter(s)" });
    else
      return res.status(200).send({ status: true, message: "Book List", data: findBook });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// GET BOOKS BY ID
const getBooksById = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    // <------------------bookId validation------------->
    if (!validator.isValidField(bookId))
      return res.status(400).send({ message: "book id is not present" });

    if (!validator.isValidObjectId(bookId))
      return res
        .status(400)
        .send({ status: false, message: `${bookId} is not a valid book id` });

    // <-------------Check bookDoc is exist in Db or not--------------->
    let book = await bookModel.findOne({ _id: bookId, isDeleted: false });

    if (!book)
      return res
        .status(404)
        .send({
          status: false,
          message: `No Book Found with This (${bookId}) BookId !!`,
        });

    // <-----------Fetch undeleted BookDocs-------------->
    let reviews = await reviewModel.find({ bookId, isDeleted: false });
    book._doc["reviewData"] = reviews;
    return res
      .status(200)
      .send({
        status: true,
        message: "Book List with Reviews",
        data: { book },
      });
  } catch (error) {
    return res.status(500).send({ status: true, message: error.message });
  }
};

// UPDATE BOOK
const updateBook = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    let requestBody = req.body;
    let { title, excerpt, releasedAt, ISBN } = requestBody;

    // <------------------bookId validation--------------->
    if (!validator.isValidRequestBody(req.params))
      return res.status(400).send({ message: "Please fill the fields !!" });

    if (!bookId)
      return res.status(400).send({ message: "please enter the BookId !!" });

    if (!validator.isValidObjectId(bookId))
      return res
        .status(400)
        .send({ status: false, message: `${bookId} is not a valid book id` });

    // <------------Body Validation----------->
    if (!validator.isValidRequestBody(requestBody))
      return res
        .status(400)
        .send({ status: false, message: "invalid request" });

    // <-----------title validation------------>

    if (!validator.isValidBookTitle(title))
      return res
        .status(400)
        .send({ status: false, message: `${title} is not a valid title` });

    // <-----------Make sure Title should be unique----------->
    let titleCheck = await bookModel.findOne({ title, isDeleted: false });
    if (titleCheck)
      return res
        .status(400)
        .send({ status: false, message: "Title should be unique" });

    // <------------Isbn validation----------->
    if (ISBN != undefined) {
      ISBN = ISBN.trim();
      if (!validator.isValidISBN(ISBN))
        return res
          .status(400)
          .send({
            status: false,
            message: "enter a valid ISBN of 10 or 13 characters",
          });
    }
    // <-----------Make sure ISBN should be unique----------->
    let checkISBN = await bookModel.findOne({ ISBN, isDeleted: false });
    if (checkISBN)
      return res
        .status(400)
        .send({ status: false, message: "ISBN should be unique" });

    // <-----------update bookDoc-------------->
    const updateBook = await bookModel.findByIdAndUpdate(
      { _id: bookId, isDeleted: false },
      { $set: { ...requestBody } },
      { new: true }
    );
    return res
      .status(200)
      .send({ status: true, message: "book updated", data: updateBook });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};


const deleteBook = async function (req, res) {
  try {
    let bookId = req.params.bookId;

    // <----------bookId validation------------>
    if (!validator.isValidRequestBody(req.params))
      return res.status(400).send({ message: "Please fill the fields !!" });

    if (!bookId)
      return res.status(400).send({ message: "please enter the BookId !!" });

    if (!validator.isValidObjectId(bookId))
      return res
        .status(400)
        .send({
          status: false,
          message: `This BookId ${bookId} is not a valid BookId`,
        });

    // <-----------Check bookDoc exist in db or not------------->
    let bookDetails = await bookModel.findById(bookId);

    if (!bookDetails)
      return res
        .status(404)
        .send({
          status: false,
          message: `No Book Found With this (${bookId}) BookId !!`,
        });

    // <-------------isDeleted updation--------------->
    if (bookDetails.isDeleted == false) {
      let deleted = await bookModel.findByIdAndUpdate(
        bookId,
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true }
      );
      return res
        .status(200)
        .send({ status: true, message: "deleted successfully" });
    } else {
      return res
        .status(404)
        .send({ status: false, message: "the book is already deleted" });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { getBooksById, createBook, getBooks, updateBook, deleteBook };
