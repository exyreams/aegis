import { supabase } from "./supabase";

export interface Document {
  id: string;
  user_id: string;
  title: string;
  document_type: string;
  content: string;
  loan_amount?: number;
  interest_rate?: number;
  term_months?: number;
  borrower_name?: string;
  lender_name?: string;
  collateral?: string;
  purpose?: string;
  additional_terms?: string;
  status: "draft" | "final" | "signed";
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentData {
  title: string;
  document_type: string;
  content: string;
  loan_amount?: number;
  interest_rate?: number;
  term_months?: number;
  borrower_name?: string;
  lender_name?: string;
  collateral?: string;
  purpose?: string;
  additional_terms?: string;
}

export const documentService = {
  async createDocument(data: CreateDocumentData): Promise<Document> {
    const { data: document, error } = await supabase
      .from("documents")
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create document: ${error.message}`);
    }

    return document;
  },

  async getDocuments(): Promise<Document[]> {
    const { data: documents, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return documents || [];
  },

  async getDocument(id: string): Promise<Document> {
    const { data: document, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch document: ${error.message}`);
    }

    return document;
  },

  async updateDocument(
    id: string,
    updates: Partial<CreateDocumentData>
  ): Promise<Document> {
    const { data: document, error } = await supabase
      .from("documents")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }

    return document;
  },

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase.from("documents").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  },
};
