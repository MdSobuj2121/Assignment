import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import Joi from 'joi'; // Import Joi for validation
import UserModel, { IUser } from './models/User';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});

// POST API to create a new user
app.post('/api/users', async (req: Request, res: Response) => {
  try {
    // Validate request body using Joi
    const schema = Joi.object({
      uid: Joi.string().required(),
      email: Joi.string().email().required(),
      role: Joi.string().valid(...['showaUser', 'showaAdmin', 'showaSubAdmin', 'serviceProviderAdmin', 'serviceProviderSubAdmin', 'serviceProviderEngineer', 'serviceProviderBranchManager', 'serviceProviderSupportStuff']).required(),
      status: Joi.string().valid('in-progress', 'approved', 'suspended').required(),
      name: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required()
      }).required(),
      phone: Joi.string().required(),
      occupation: Joi.string(),
      dateOfBirth: Joi.date().required(),
      gender: Joi.string().valid('male', 'female', 'prefer-not-answer').required(),
      photoUrl: Joi.string(),
      addresses: Joi.array().items(Joi.object({
        isDeleted: Joi.boolean().default(false),
        address: Joi.object({
          street: Joi.string().required(),
          city: Joi.string().required(),
          prefecture: Joi.string().required(),
          postalCode: Joi.string().required(),
          country: Joi.string().required(),
          buildingName: Joi.string().required(),
          roomNumber: Joi.string().required(),
          state: Joi.string(),
          details: Joi.string()
        }).required()
      }))
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Create new user instance
    const newUser: IUser = new UserModel(req.body);

    // Save user to database
    await newUser.save();

    return res.status(201).json(newUser);
  } catch (err) {
    console.error('Error creating user', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET API to find all users by email or phone
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.query;

    if (!email && !phone) {
      return res.status(400).json({ error: 'Provide email or phone parameter' });
    }

    let query: any = {};
    if (email) {
      query.email = email;
    }
    if (phone) {
      query.phone = phone;
    }

    const users = await UserModel.find(query);
    return res.json(users);
  } catch (err) {
    console.error('Error finding users', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
