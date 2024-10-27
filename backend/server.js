const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Schema & Model
const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  dob: Date,
  math: Number,
  physics: Number,
  chemistry: Number,
  cutoff: Number,
});

const Student = mongoose.model('Student', studentSchema);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/students', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Calculate Cutoff Marks
const calculateCutoff = (math, physics, chemistry) => {
  mark=(math + physics + chemistry);
  return  mark / 3;
};

// POST API to Add Student Data
app.post('/api/students', async (req, res) => {
  const { name, email, dob, math, physics, chemistry } = req.body;
  const cutoff = calculateCutoff(math, physics, chemistry);

  const newStudent = new Student({
    name,
    email,
    dob,
    math,
    physics,
    chemistry,
    cutoff,
  });

  await newStudent.save();

  // Send email notification
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'chezhiyan0000@gmail.com',
      pass: 'eofwouzenewoiuzb',
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Cutoff Marks Notification',
    text: `Dear ${name},\n\nYour cutoff marks are ${cutoff}.\n\nBest Regards,\nStudent Info System`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  res.status(201).json({ message: 'Student data saved and email sent!', student: newStudent });
});

// GET API to Retrieve All Students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving students' });
  }
});

// PUT API to Update Student Data
app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, dob, math, physics, chemistry } = req.body;
  const cutoff = calculateCutoff(math, physics, chemistry);

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { name, email, dob, math, physics, chemistry, cutoff },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student data updated successfully', student: updatedStudent });
  } catch (error) {
    res.status(500).json({ message: 'Error updating student' });
  }
});

// DELETE API to Delete a Student
app.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student' });
  }
});

// Start Server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
