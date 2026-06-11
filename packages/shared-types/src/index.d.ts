import { z } from 'zod';
export declare enum UserRole {
    ADMIN = "admin",
    ELDER = "elder",
    CONTRIBUTOR = "contributor",
    MEMBER = "member",
    VIEWER = "viewer"
}
export declare enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other"
}
export declare enum DateAccuracy {
    EXACT = "exact",
    APPROXIMATE = "approximate",
    ESTIMATED = "estimated",
    UNKNOWN = "unknown"
}
export declare enum PrivacyLevel {
    PRIVATE = "private",
    FAMILY = "family",
    INVITED = "invited",
    PUBLIC = "public"
}
export declare enum ApprovalStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    REVOKED = "revoked"
}
export declare enum EventType {
    WEDDING = "wedding",
    BRATABANDHA = "bratabandha",
    MEMORIAL = "memorial",
    GATHERING = "gathering"
}
export declare enum NotificationType {
    APPROVAL_REQUEST = "approval_request",
    INVITATION = "invitation",
    MENTION = "mention",
    MILESTONE = "milestone"
}
export declare enum NotificationChannel {
    IN_APP = "in_app",
    EMAIL = "email",
    PUSH = "push"
}
export declare enum ActionType {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    APPROVE = "approve",
    REJECT = "reject"
}
export interface User {
    id: string;
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    profileImageUrl?: string;
    bio?: string;
    notificationPreferences: NotificationPreferences;
    language: string;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface NotificationPreferences {
    inApp: boolean;
    email: boolean;
    push: boolean;
    approvalRequests: boolean;
    familyInvitations: boolean;
    mentions: boolean;
}
export interface Family {
    id: string;
    name: string;
    description?: string;
    founderId: string;
    profileImageUrl?: string;
    ancestralVillage?: string;
    ancestralDistrict?: string;
    ancestralProvince?: string;
    metadata: Record<string, unknown>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface FamilyMember {
    id: string;
    familyId: string;
    userId: string;
    role: UserRole;
    relationshipToFounder?: string;
    isApproved: boolean;
    approvedAt?: Date;
    approvedBy?: string;
    invitedAt?: Date;
    invitedBy?: string;
    permissions: FamilyMemberPermissions;
    createdAt: Date;
    updatedAt: Date;
}
export interface FamilyMemberPermissions {
    editTree: boolean;
    approveChanges: boolean;
    inviteMembers: boolean;
    uploadMedia: boolean;
    manageMemorials: boolean;
    viewLivingData: boolean;
}
export interface Person {
    id: string;
    familyId: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    nepaliName?: string;
    gender: Gender;
    birthDate?: Date;
    birthDateAccuracy: DateAccuracy;
    deathDate?: Date;
    deathDateAccuracy: DateAccuracy;
    isLiving: boolean;
    photoUrl?: string;
    biography?: string;
    caste?: string;
    subCaste?: string;
    gotra?: string;
    ancestralVillage?: string;
    ancestralDistrict?: string;
    ancestralProvince?: string;
    ancestralCountry: string;
    fatherId?: string;
    motherId?: string;
    privacyLevel: PrivacyLevel;
    birthVisibility: PrivacyLevel;
    deathVisibility: PrivacyLevel;
    relationVisibility: PrivacyLevel;
    memorialEnabled: boolean;
    isVerified: boolean;
    verificationDate?: Date;
    createdBy?: string;
    approvedBy?: string;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export interface ApprovalRequest {
    id: string;
    familyId: string;
    personId: string;
    requestedBy: string;
    approvedBy?: string;
    requestedChanges: Record<string, unknown>;
    currentValues: Record<string, unknown>;
    status: ApprovalStatus;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
    approvedAt?: Date;
    expiresAt: Date;
}
export interface MediaUpload {
    id: string;
    familyId: string;
    personId?: string;
    uploadedBy: string;
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize: number;
    mimeType?: string;
    r2Key?: string;
    description?: string;
    isProfilePhoto: boolean;
    privacyLevel: PrivacyLevel;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export interface Invitation {
    id: string;
    familyId: string;
    invitedEmail: string;
    invitedBy: string;
    token: string;
    role: UserRole;
    isAccepted: boolean;
    acceptedBy?: string;
    acceptedAt?: Date;
    expiresAt: Date;
    createdAt: Date;
}
export interface Notification {
    id: string;
    userId: string;
    senderId?: string;
    title: string;
    message: string;
    type: NotificationType;
    relatedId?: string;
    relatedType?: string;
    data: Record<string, unknown>;
    isRead: boolean;
    readAt?: Date;
    channels: NotificationChannel[];
    createdAt: Date;
    updatedAt: Date;
}
export interface Event {
    id: string;
    familyId: string;
    title: string;
    description?: string;
    eventType: EventType;
    eventDate: Date;
    location?: string;
    organizerId: string;
    isPublished: boolean;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export interface EventInvitation {
    id: string;
    eventId: string;
    invitedUserId: string;
    status: 'pending' | 'accepted' | 'declined';
    rsvpAt?: Date;
    createdAt: Date;
}
export interface OCRImport {
    id: string;
    familyId: string;
    uploadedBy: string;
    fileUrl: string;
    extractedText?: string;
    extractedPeople?: unknown[];
    extractedRelationships?: unknown[];
    confidenceScore?: number;
    status: 'pending_review' | 'approved' | 'merged' | 'rejected';
    reviewNotes?: string;
    reviewedBy?: string;
    isMerged: boolean;
    mergedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuditLog {
    id: string;
    actorId?: string;
    action: ActionType;
    resourceType: string;
    resourceId: string;
    familyId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    status: 'success' | 'failure';
    errorMessage?: string;
    createdAt: Date;
    metadata: Record<string, unknown>;
}
export interface CreatePersonRequest {
    firstName: string;
    lastName: string;
    gender: Gender;
    birthDate?: Date;
    birthDateAccuracy?: DateAccuracy;
    deathDate?: Date;
    deathDateAccuracy?: DateAccuracy;
    fatherId?: string;
    motherId?: string;
    nepaliName?: string;
    gotra?: string;
    caste?: string;
    ancestralVillage?: string;
    biography?: string;
}
export interface UpdatePersonRequest {
    firstName?: string;
    lastName?: string;
    birthDate?: Date;
    deathDate?: Date;
    biography?: string;
    photoUrl?: string;
}
export interface CreateFamilyRequest {
    name: string;
    description?: string;
    ancestralVillage?: string;
    ancestralDistrict?: string;
    ancestralProvince?: string;
}
export interface InviteFamilyMemberRequest {
    email: string;
    role: UserRole;
}
export interface CreateApprovalRequest {
    personId: string;
    requestedChanges: Record<string, unknown>;
}
export interface ApprovePendingRequest {
    approvalId: string;
    approved: boolean;
    rejectionReason?: string;
}
export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    timestamp: Date;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        hasMore: boolean;
    };
}
export declare const CreatePersonSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    gender: z.ZodEnum<["male", "female", "other"]>;
    birthDate: z.ZodOptional<z.ZodDate>;
    birthDateAccuracy: z.ZodOptional<z.ZodEnum<["exact", "approximate", "estimated", "unknown"]>>;
    deathDate: z.ZodOptional<z.ZodDate>;
    deathDateAccuracy: z.ZodOptional<z.ZodEnum<["exact", "approximate", "estimated", "unknown"]>>;
    fatherId: z.ZodOptional<z.ZodString>;
    motherId: z.ZodOptional<z.ZodString>;
    nepaliName: z.ZodOptional<z.ZodString>;
    gotra: z.ZodOptional<z.ZodString>;
    caste: z.ZodOptional<z.ZodString>;
    ancestralVillage: z.ZodOptional<z.ZodString>;
    biography: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    gender: "male" | "female" | "other";
    ancestralVillage?: string | undefined;
    nepaliName?: string | undefined;
    birthDate?: Date | undefined;
    birthDateAccuracy?: "unknown" | "exact" | "approximate" | "estimated" | undefined;
    deathDate?: Date | undefined;
    deathDateAccuracy?: "unknown" | "exact" | "approximate" | "estimated" | undefined;
    biography?: string | undefined;
    caste?: string | undefined;
    gotra?: string | undefined;
    fatherId?: string | undefined;
    motherId?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    gender: "male" | "female" | "other";
    ancestralVillage?: string | undefined;
    nepaliName?: string | undefined;
    birthDate?: Date | undefined;
    birthDateAccuracy?: "unknown" | "exact" | "approximate" | "estimated" | undefined;
    deathDate?: Date | undefined;
    deathDateAccuracy?: "unknown" | "exact" | "approximate" | "estimated" | undefined;
    biography?: string | undefined;
    caste?: string | undefined;
    gotra?: string | undefined;
    fatherId?: string | undefined;
    motherId?: string | undefined;
}>;
export declare const CreateFamilySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    ancestralVillage: z.ZodOptional<z.ZodString>;
    ancestralDistrict: z.ZodOptional<z.ZodString>;
    ancestralProvince: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
    ancestralVillage?: string | undefined;
    ancestralDistrict?: string | undefined;
    ancestralProvince?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    ancestralVillage?: string | undefined;
    ancestralDistrict?: string | undefined;
    ancestralProvince?: string | undefined;
}>;
export declare const InviteFamilyMemberSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodEnum<["admin", "elder", "contributor", "member", "viewer"]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: "member" | "admin" | "elder" | "contributor" | "viewer";
}, {
    email: string;
    role: "member" | "admin" | "elder" | "contributor" | "viewer";
}>;
export declare const ErrorCodes: {
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly TOKEN_EXPIRED: "TOKEN_EXPIRED";
    readonly INVALID_INPUT: "INVALID_INPUT";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly ALREADY_EXISTS: "ALREADY_EXISTS";
    readonly OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED";
    readonly APPROVAL_REQUIRED: "APPROVAL_REQUIRED";
    readonly PERMISSION_DENIED: "PERMISSION_DENIED";
    readonly INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR";
    readonly SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE";
};
//# sourceMappingURL=index.d.ts.map