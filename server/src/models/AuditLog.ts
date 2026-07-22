import { Schema, model } from 'mongoose';

const auditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true },
    details: { type: String },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AuditLog = model('AuditLog', auditLogSchema);
