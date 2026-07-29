import mongoose, { Model, Schema, models } from 'mongoose'

export interface IAiInsightsCache {
  userId: mongoose.Types.ObjectId
  result: {
    trend: string
    anomalies: string[]
    suggestion: string
  }
  createdAt: Date
}

const aiInsightsCacheSchema = new Schema<IAiInsightsCache>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  result: {
    type: Object,
    required: true,
  },
  createdAt: { type: Date, default: Date.now, index: true },
})

aiInsightsCacheSchema.index({ userId: 1, createdAt: -1 })

const AiInsightsCache: Model<IAiInsightsCache> =
  models.AiInsightsCache || mongoose.model<IAiInsightsCache>('AiInsightsCache', aiInsightsCacheSchema)

export { AiInsightsCache }
