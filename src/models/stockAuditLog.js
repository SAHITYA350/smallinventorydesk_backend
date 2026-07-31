import mongoose from 'mongoose';

const stockAuditLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    oldQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      default: 'Manual update',
    },
  },
  { timestamps: true }
);

export default mongoose.model('StockAuditLog', stockAuditLogSchema);
