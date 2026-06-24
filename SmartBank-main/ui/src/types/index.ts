export interface StatsResponse {
  total_cases: number
  resolved: number
  pending: number
  human_review: number
  critical: number
  avg_resolution_time: string
  automation_rate: number
  sla_compliance: number
}

export interface CaseItem {
  id: string
  customer_name: string
  type: string
  status: string
  priority: string
  channel: string
  time: string
  date: string
}

export interface CaseListResponse {
  cases: CaseItem[]
  total: number
  page: number
  page_size: number
}

export interface AnalyticsResponse {
  by_status: Record<string, number>
  by_priority: Record<string, number>
  by_channel: Record<string, number>
}

export interface ClassifyResponse {
  request_id: string
  timestamp: string
  channel: string
  detected_language: string
  intent: { code: string; label: string; confidence: number }
  entities: Record<string, string | null>
  escalate_to_human: boolean
}

export interface ChatResponse {
  text: string
  language: string
  module: string | null
  escalation: boolean
  escalation_reason: string | null
}

export interface DocumentVerifyResponse {
  filename: string | null
  size: number
  document_type: string
  risk_score: number
  risk_level: string
  decision: string
  extracted_fields: Record<string, unknown>
  fraud_indicators: string[]
  processing_id: string
}

export interface HealthResponse {
  status: string
  service: string
  version: string
  database: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface UserResponse {
  id: string
  username: string
  role: string
}

export interface WorkflowItem {
  name: string
  file: string
  size: number
  process_id: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
  timestamp: number
  id?: number
  language?: string
  module?: string | null
}

export interface AdminUser {
  id: string
  clerk_id: string
  username: string
  email: string
  role: string
  created_at: string
  case_count: number
}

export interface AdminAuditEntry {
  id: number
  timestamp: string
  action: string
  actor: string
  resource: string
  details: string
  previous_hash: string
  hash: string
}

export interface AuditStats {
  total_entries: number
  by_action: Record<string, number>
  integrity_valid: boolean
  last_entry_id: number | null
  last_entry_hash: string | null
}

export interface ChatSession {
  session_id: string
  messages: {
    id: number
    role: string
    text: string
    language: string | null
    module: string | null
    created_at: string
  }[]
}
