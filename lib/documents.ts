import { supabase } from "./supabase";

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
  created_at: string;
  updated_at: string;
}

export const documentService = {
  async createDocument(data: CreateDocumentData): Promise<Document> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const { data: document, error } = await supabase
      .from("documents")
      .insert({
        ...data,
        user_id: user.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating document:", error);
      throw new Error("Failed to create document");
    }

    return document;
  },

  async getDocuments(): Promise<Document[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const { data: documents, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
      throw new Error("Failed to fetch documents");
    }

    return documents || [];
  },

  async getDocument(id: string): Promise<Document | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const { data: document, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Document not found
      }
      console.error("Error fetching document:", error);
      throw new Error("Failed to fetch document");
    }

    return document;
  },

  async updateDocument(
    id: string,
    data: Partial<CreateDocumentData>
  ): Promise<Document> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const { data: document, error } = await supabase
      .from("documents")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating document:", error);
      throw new Error("Failed to update document");
    }

    return document;
  },

  async deleteDocument(id: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)
      .eq("user_id", user.user.id);

    if (error) {
      console.error("Error deleting document:", error);
      throw new Error("Failed to delete document");
    }
  },

  async getDocumentsByType(documentType: string): Promise<Document[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const { data: documents, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("document_type", documentType)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents by type:", error);
      throw new Error("Failed to fetch documents");
    }

    return documents || [];
  },
};
