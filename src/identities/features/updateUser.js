"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.UpdateUserHandler = exports.UpdateUserController = exports.UpdateUser = void 0;
const mediatr_js_1 = require("../../mediatr.js");
const role_1 = require("../enums/role");
const dataSource_1 = require("../../data/dataSource");
const user_1 = require("../entities/user");
const encryption_1 = require("../../utils/encryption");
const userDto_1 = require("../dtos/userDto");
const mapping_1 = __importDefault(require("../mapping"));
const tsoa_1 = require("tsoa");
const http_status_1 = __importDefault(require("http-status"));
const joi_1 = __importDefault(require("joi"));
const notFoundError_1 = __importDefault(require("../../types/notFoundError"));
const validation_1 = require("../../utils/validation");
class UpdateUser {
    constructor(request = {}) {
        Object.assign(this, request);
    }
}
exports.UpdateUser = UpdateUser;
const updateUserValidations = joi_1.default.object({
    email: joi_1.default.string().required().email(),
    password: joi_1.default.string().required().custom(validation_1.password),
    name: joi_1.default.string().required(),
    role: joi_1.default.string().required().valid(role_1.Role.USER, role_1.Role.ADMIN)
});
let UpdateUserController = class UpdateUserController extends tsoa_1.Controller {
    updateUser(id, request) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield mediatr_js_1.mediatrJs.send(new UpdateUser({
                id: id,
                email: request.email,
                password: request.password,
                name: request.name,
                role: request.role
            }));
            this.setStatus(http_status_1.default.NO_CONTENT);
            return result;
        });
    }
};
exports.UpdateUserController = UpdateUserController;
__decorate([
    (0, tsoa_1.Put)('v1/update'),
    (0, tsoa_1.Security)("jwt"),
    (0, tsoa_1.SuccessResponse)('204', 'NO_CONTENT'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UpdateUserController.prototype, "updateUser", null);
exports.UpdateUserController = UpdateUserController = __decorate([
    (0, tsoa_1.Route)('/identity')
], UpdateUserController);
class UpdateUserHandler {
    handle(request) {
        return __awaiter(this, void 0, void 0, function* () {
            yield updateUserValidations.validateAsync(request);
            const userRepository = dataSource_1.dataSource.getRepository(user_1.User);
            const existUser = yield userRepository.findOneBy({
                id: request.id
            });
            if (!existUser) {
                throw new notFoundError_1.default('User not found');
            }
            const updatedUser = {
                email: request.email,
                name: request.name,
                role: request.role,
                password: yield (0, encryption_1.encryptPassword)(request.password),
                isEmailVerified: false,
                updatedAt: new Date()
            };
            const userEntity = yield userRepository.save(updatedUser);
            const result = mapping_1.default.map(userEntity, new userDto_1.UserDto());
            return result;
        });
    }
}
exports.UpdateUserHandler = UpdateUserHandler;
const updateUserHandler = new UpdateUserHandler();
mediatr_js_1.mediatrJs.registerHandler(UpdateUser, updateUserHandler);
//# sourceMappingURL=updateUser.js.map