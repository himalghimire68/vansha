// ============================================
// SHARED TYPES - VANSHA PLATFORM
// ============================================
// TypeScript interfaces and DTOs for type safety across monorepo
// All types are strict (no `any`) and validation-ready

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export enum UserRole {
  ADMIN = 'admin',
  ELDER = 'elder',
  CONTRIBUTOR = 'contributor',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum DateAccuracy {
  EXACT = 'exact',
  APPROXIMATE = 'approximate',
  ESTIMATED = 'estimated',
  UNKNOWN = 'unknown',
}

export enum PrivacyLevel {
  PRIVATE = 'private',
  FAMILY = 'family',
  INVITED = 'invited',
  PUBLIC = 'public',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVOKED = 'revoked',
}

export enum EventType {
  WEDDING = 'wedding',
  BRATABANDHA = 'bratabandha',
  MEMORIAL = 'memorial',
  GATHERING = 'gathering',
}

export enum NotificationType {
  APPROVAL_REQUEST = 'approval_request',
  INVITATION = 'invitation',
  MENTION = 'mention',
  MILESTONE = 'milestone',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
}

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
}

// ============================================
// CORE ENTITIES
// ============================================

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

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

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

// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

export const CreatePersonSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  gender: z.enum(['male', 'female', 'other']),
  birthDate: z.date().optional(),
  birthDateAccuracy: z.enum(['exact', 'approximate', 'estimated', 'unknown']).optional(),
  deathDate: z.date().optional(),
  deathDateAccuracy: z.enum(['exact', 'approximate', 'estimated', 'unknown']).optional(),
  fatherId: z.string().uuid().optional(),
  motherId: z.string().uuid().optional(),
  nepaliName: z.string().max(255).optional(),
  gotra: z.string().max(255).optional(),
  caste: z.string().max(255).optional(),
  ancestralVillage: z.string().max(255).optional(),
  biography: z.string().optional(),
});

export const CreateFamilySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  ancestralVillage: z.string().max(255).optional(),
  ancestralDistrict: z.string().max(255).optional(),
  ancestralProvince: z.string().max(255).optional(),
});

export const InviteFamilyMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'elder', 'contributor', 'member', 'viewer']),
});

// ============================================
// ERROR CODES
// ============================================

export const ErrorCodes = {
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
} as const;

// ============================================
// TYPE EXPORTS
// ============================================

export type UserRole = typeof UserRole[keyof typeof UserRole];
export type Gender = typeof Gender[keyof typeof Gender];
export type DateAccuracy = typeof DateAccuracy[keyof typeof DateAccuracy];
export type PrivacyLevel = typeof PrivacyLevel[keyof typeof PrivacyLevel];
export type ApprovalStatus = typeof ApprovalStatus[keyof typeof ApprovalStatus];
export type EventType = typeof EventType[keyof typeof EventType];
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];
export type ActionType = typeof ActionType[keyof typeof ActionType];
