"use strict";
// ============================================
// SHARED TYPES - VANSHA PLATFORM
// ============================================
// TypeScript interfaces and DTOs for type safety across monorepo
// All types are strict (no `any`) and validation-ready
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = exports.InviteFamilyMemberSchema = exports.CreateFamilySchema = exports.CreatePersonSchema = exports.ActionType = exports.NotificationChannel = exports.NotificationType = exports.EventType = exports.ApprovalStatus = exports.PrivacyLevel = exports.DateAccuracy = exports.Gender = exports.UserRole = void 0;
const zod_1 = require("zod");
// ============================================
// ENUMS
// ============================================
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["ELDER"] = "elder";
    UserRole["CONTRIBUTOR"] = "contributor";
    UserRole["MEMBER"] = "member";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (exports.UserRole = UserRole = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["OTHER"] = "other";
})(Gender || (exports.Gender = Gender = {}));
var DateAccuracy;
(function (DateAccuracy) {
    DateAccuracy["EXACT"] = "exact";
    DateAccuracy["APPROXIMATE"] = "approximate";
    DateAccuracy["ESTIMATED"] = "estimated";
    DateAccuracy["UNKNOWN"] = "unknown";
})(DateAccuracy || (exports.DateAccuracy = DateAccuracy = {}));
var PrivacyLevel;
(function (PrivacyLevel) {
    PrivacyLevel["PRIVATE"] = "private";
    PrivacyLevel["FAMILY"] = "family";
    PrivacyLevel["INVITED"] = "invited";
    PrivacyLevel["PUBLIC"] = "public";
})(PrivacyLevel || (exports.PrivacyLevel = PrivacyLevel = {}));
var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING"] = "pending";
    ApprovalStatus["APPROVED"] = "approved";
    ApprovalStatus["REJECTED"] = "rejected";
    ApprovalStatus["REVOKED"] = "revoked";
})(ApprovalStatus || (exports.ApprovalStatus = ApprovalStatus = {}));
var EventType;
(function (EventType) {
    EventType["WEDDING"] = "wedding";
    EventType["BRATABANDHA"] = "bratabandha";
    EventType["MEMORIAL"] = "memorial";
    EventType["GATHERING"] = "gathering";
})(EventType || (exports.EventType = EventType = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["APPROVAL_REQUEST"] = "approval_request";
    NotificationType["INVITATION"] = "invitation";
    NotificationType["MENTION"] = "mention";
    NotificationType["MILESTONE"] = "milestone";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["IN_APP"] = "in_app";
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["PUSH"] = "push";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var ActionType;
(function (ActionType) {
    ActionType["CREATE"] = "create";
    ActionType["UPDATE"] = "update";
    ActionType["DELETE"] = "delete";
    ActionType["APPROVE"] = "approve";
    ActionType["REJECT"] = "reject";
})(ActionType || (exports.ActionType = ActionType = {}));
// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================
exports.CreatePersonSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(255),
    lastName: zod_1.z.string().min(1).max(255),
    gender: zod_1.z.enum(['male', 'female', 'other']),
    birthDate: zod_1.z.date().optional(),
    birthDateAccuracy: zod_1.z.enum(['exact', 'approximate', 'estimated', 'unknown']).optional(),
    deathDate: zod_1.z.date().optional(),
    deathDateAccuracy: zod_1.z.enum(['exact', 'approximate', 'estimated', 'unknown']).optional(),
    fatherId: zod_1.z.string().uuid().optional(),
    motherId: zod_1.z.string().uuid().optional(),
    nepaliName: zod_1.z.string().max(255).optional(),
    gotra: zod_1.z.string().max(255).optional(),
    caste: zod_1.z.string().max(255).optional(),
    ancestralVillage: zod_1.z.string().max(255).optional(),
    biography: zod_1.z.string().optional(),
});
exports.CreateFamilySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().optional(),
    ancestralVillage: zod_1.z.string().max(255).optional(),
    ancestralDistrict: zod_1.z.string().max(255).optional(),
    ancestralProvince: zod_1.z.string().max(255).optional(),
});
exports.InviteFamilyMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(['admin', 'elder', 'contributor', 'member', 'viewer']),
});
// ============================================
// ERROR CODES
// ============================================
exports.ErrorCodes = {
    // Authentication
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    // Validation
    INVALID_INPUT: 'INVALID_INPUT',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    // Resources
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    // Business Logic
    OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
    APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    // Server
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
};
// ============================================
// TYPE EXPORTS
// ============================================
// The enum declarations above are exported as types automatically,
// so explicit duplicate type aliases are not needed here.
//# sourceMappingURL=index.js.map