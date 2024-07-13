"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const joi_1 = __importDefault(require("joi"));
const User_1 = __importDefault(require("./models/User"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(body_parser_1.default.json());
// MongoDB connection string
const mongoURI = 'mongodb://localhost:27017/userDB';
// Connect to MongoDB
mongoose_1.default.connect(mongoURI, {
    useUnifiedTopology: true,
    useCreateIndex: true, // Ensure indexes are created
    useFindAndModify: false // Disable deprecated features
})
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
});
// Define routes
// POST API to create a new user
app.post('/api/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body using Joi
        const schema = joi_1.default.object({
            uid: joi_1.default.string().required(),
            email: joi_1.default.string().email().required(),
            role: joi_1.default.string().valid(...['showaUser', 'showaAdmin', 'showaSubAdmin', 'serviceProviderAdmin', 'serviceProviderSubAdmin', 'serviceProviderEngineer', 'serviceProviderBranchManager', 'serviceProviderSupportStuff']).required(),
            status: joi_1.default.string().valid('in-progress', 'approved', 'suspended').required(),
            name: joi_1.default.object({
                firstName: joi_1.default.string().required(),
                lastName: joi_1.default.string().required()
            }).required(),
            phone: joi_1.default.string().required(),
            occupation: joi_1.default.string(),
            dateOfBirth: joi_1.default.date().required(),
            gender: joi_1.default.string().valid('male', 'female', 'prefer-not-answer').required(),
            photoUrl: joi_1.default.string(),
            addresses: joi_1.default.array().items(joi_1.default.object({
                isDeleted: joi_1.default.boolean().default(false),
                address: joi_1.default.object({
                    street: joi_1.default.string().required(),
                    city: joi_1.default.string().required(),
                    prefecture: joi_1.default.string().required(),
                    postalCode: joi_1.default.string().required(),
                    country: joi_1.default.string().required(),
                    buildingName: joi_1.default.string().required(),
                    roomNumber: joi_1.default.string().required(),
                    state: joi_1.default.string(),
                    details: joi_1.default.string()
                }).required()
            }))
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        // Create new user instance
        const newUser = new User_1.default(req.body);
        // Save user to database
        yield newUser.save();
        return res.status(201).json(newUser);
    }
    catch (err) {
        console.error('Error creating user', err);
        return res.status(500).json({ error: 'Server error' });
    }
}));
// GET API to find all users by email or phone
app.get('/api/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phone } = req.query;
        if (!email && !phone) {
            return res.status(400).json({ error: 'Provide email or phone parameter' });
        }
        let query = {};
        if (email) {
            query.email = email;
        }
        if (phone) {
            query.phone = phone;
        }
        const users = yield User_1.default.find(query);
        return res.json(users);
    }
    catch (err) {
        console.error('Error finding users', err);
        return res.status(500).json({ error: 'Server error' });
    }
}));
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
