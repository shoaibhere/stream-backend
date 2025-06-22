export interface CampaignData {
  title: string
  message: {
    title: string
    body: string
  }
  targetAudience: "all-users" | "live-matches" | "custom"
  customTopic?: string
  campaignType?: "instant" | "scheduled" | "recurring"
  scheduledAt?: string
  matchId?: string
  status?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateCampaignData(data: any): ValidationResult {
  const errors: string[] = []

  // Check required fields
  if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
    errors.push("Campaign title is required")
  }

  if (!data.message || typeof data.message !== "object") {
    errors.push("Message object is required")
  } else {
    if (!data.message.title || typeof data.message.title !== "string" || !data.message.title.trim()) {
      errors.push("Notification title is required")
    }

    if (!data.message.body || typeof data.message.body !== "string" || !data.message.body.trim()) {
      errors.push("Notification message is required")
    }
  }

  if (!data.targetAudience || typeof data.targetAudience !== "string") {
    errors.push("Target audience is required")
  } else if (!["all-users", "live-matches", "custom"].includes(data.targetAudience)) {
    errors.push("Invalid target audience")
  }

  if (data.targetAudience === "custom") {
    if (!data.customTopic || typeof data.customTopic !== "string" || !data.customTopic.trim()) {
      errors.push("Custom topic is required when using custom audience")
    }
  }

  if (data.campaignType && !["instant", "scheduled", "recurring"].includes(data.campaignType)) {
    errors.push("Invalid campaign type")
  }

  if (data.scheduledAt) {
    const scheduledDate = new Date(data.scheduledAt)
    if (isNaN(scheduledDate.getTime())) {
      errors.push("Invalid scheduled date format")
    } else if (scheduledDate <= new Date()) {
      errors.push("Scheduled date must be in the future")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
