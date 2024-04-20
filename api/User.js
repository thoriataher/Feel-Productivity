const express = require('express');
const { status } = require('express/lib/response');
const router = express.Router();
const User = require('./../models/User');
const bcrypt = require('bcrypt');

//Sign-Up
router.post('/signup', (req, res) => {
    let { name, email, password } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
   
    if (name == "" || password == "" || email == "") {
        res.json({
            status: "FAILED",
            message: "Empty input fields"
        });
    } else if (!/^[a-zA-Z]*$/.test(name)) {
        res.json({
            status: "FAILED",
            message: "Invalid name entered"
        });
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "FAILED",
            message: "Invalid email entered"
        });
    } else if (password.length < 8) {
        res.json({
            status: "FAILED",
            message: "Password is too Weak"
        });
    } else {
        // Email already exists
        User.find({ email }).then(result => {
            if (result.length) {
                res.json({
                    status: "FAILED",
                    message: "Email already exists"
                });
            } else {
                // Create new user
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword
                    });
                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "Sign-up successful",
                            data: result
                        });
                    }).catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occurred while saving user data"
                        });
                    });
                }).catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while hashing password"
                    });
                });
            }
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existing user account"
            });
        });
    }
});

//Sign-in
router.post('/signin', (req, res) => {
    // Sign-in logic goes here
    let {email, password} = req.body;
    email = email.trim();
    password = password.trim();

    if(email == "" || password ==""){
        res.json({
            status: "FAILED",
            message: "empty fields"
        });
    }else {
        User.find({email}).then(data => {

            if(data.length){
            const hashedpassword = data[0].password;
            bcrypt.compare(password, hashedpassword).then(result =>{
                if(result){
                    res.json({
                        status: "Success",
                        message: "Signin successfully",
                        data: data
                    });
                }else{
                        res.json({
                            status: "FAILD",
                            message:"Invalid password entered!"
                        })
                }
            }).catch(err => {
                res.json({
                    status: "FAILED",
                    message: "An error occured while comparing password."
                })
            })
            }else{
                res.json({
                    status:"FAILD",
                    message:"Invalid credintails entered"
                })
            }
    
        }).catch(err => {
            res.json({
                status:"FAILD",
                message: "An error occured while checking exisiting user"
            })
        })
    }
    
});

module.exports = router;
