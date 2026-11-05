export type LeadStatus = "new" | "contacted" | "archived";
export interface LeadRecord {
  id: string;
  name: string;
  initials: string;
  company: string;
  email: string;
  message: string;
  date: string;
  channel: string;
  status: LeadStatus;
}
export interface ContactsGateway {
  list(): Promise<LeadRecord[]>;
  setStatus(id: string, status: LeadStatus): Promise<LeadRecord>;
}
