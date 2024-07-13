"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    uid: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['showaUser', 'showaAdmin', 'showaSubAdmin', 'serviceProviderAdmin', 'serviceProviderSubAdmin', 'serviceProviderEngineer', 'serviceProviderBranchManager', 'serviceProviderSupportStuff'], required: true },
    status: { type: String, enum: ['in-progress', 'approved', 'suspended'], required: true },
    name: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true }
    },
    phone: { type: String, required: true },
    occupation: { type: String },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'prefer-not-answer'], required: true },
    photoUrl: { type: String },
    addresses: [{
            isDeleted: { type: Boolean, default: false },
            address: {
                street: { type: String },
                city: { type: String },
                prefecture: { type: String },
                postalCode: { type: String },
                country: { type: String },
                buildingName: { type: String },
                roomNumber: { type: String },
                state: { type: String },
                details: { type: String }
            }
        }]
});
const UserModel = mongoose_1.default.model('User', UserSchema);
exports.default = UserModel;
