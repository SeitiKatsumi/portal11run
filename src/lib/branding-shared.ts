export const brandingStatuses = [
  "RECEIVED",
  "IN_REVIEW",
  "CHANGES_REQUESTED",
  "APPROVED",
  "REJECTED",
  "EXPIRED"
] as const;

export type BrandingStatus = (typeof brandingStatuses)[number];

export type BrandingRequest = {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  organization: string;
  intended_use: string;
  channels: string;
  notes: string | null;
  status: BrandingStatus;
  admin_notes: string | null;
  handled_by: string | null;
  handled_at: string | null;
  ip_hash: string | null;
  created_at: string;
  updated_at: string;
};

export type BrandingFile = {
  id: string;
  request_id: string;
  original_name: string;
  storage_name: string;
  mime_type: string;
  size_bytes: number;
  kind: string;
  created_at: string;
};
