import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  documentService,
  type Document,
  type CreateDocumentData,
} from "@/lib/documents";
import { toast } from "sonner";

// Query keys
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...documentKeys.lists(), { filters }] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  byType: (type: string) => [...documentKeys.all, "byType", type] as const,
};

// Get all documents
export function useDocuments() {
  return useQuery({
    queryKey: documentKeys.lists(),
    queryFn: () => documentService.getDocuments(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get single document
export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentService.getDocument(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get documents by type
export function useDocumentsByType(type: string) {
  return useQuery({
    queryKey: documentKeys.byType(type),
    queryFn: () => documentService.getDocumentsByType(type),
    enabled: !!type && type !== "all",
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Create document mutation
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentData) =>
      documentService.createDocument(data),
    onSuccess: (newDocument) => {
      // Invalidate and refetch documents list
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });

      // Add the new document to the cache optimistically
      queryClient.setQueryData(
        documentKeys.lists(),
        (old: Document[] | undefined) => {
          if (!old) return [newDocument];
          return [newDocument, ...old];
        }
      );

      // Set the individual document in cache
      queryClient.setQueryData(
        documentKeys.detail(newDocument.id),
        newDocument
      );

      toast.success("Document created successfully!");
    },
    onError: (error) => {
      console.error("Error creating document:", error);
      toast.error("Failed to create document");
    },
  });
}

// Update document mutation
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateDocumentData>;
    }) => documentService.updateDocument(id, data),
    onSuccess: (updatedDocument) => {
      // Update the document in the list cache
      queryClient.setQueryData(
        documentKeys.lists(),
        (old: Document[] | undefined) => {
          if (!old) return [updatedDocument];
          return old.map((doc) =>
            doc.id === updatedDocument.id ? updatedDocument : doc
          );
        }
      );

      // Update the individual document cache
      queryClient.setQueryData(
        documentKeys.detail(updatedDocument.id),
        updatedDocument
      );

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: documentKeys.byType(updatedDocument.document_type),
      });

      toast.success("Document updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating document:", error);
      toast.error("Failed to update document");
    },
  });
}

// Delete document mutation
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentService.deleteDocument(id),
    onSuccess: (_, deletedId) => {
      // Remove from documents list cache
      queryClient.setQueryData(
        documentKeys.lists(),
        (old: Document[] | undefined) => {
          if (!old) return [];
          return old.filter((doc) => doc.id !== deletedId);
        }
      );

      // Remove individual document from cache
      queryClient.removeQueries({ queryKey: documentKeys.detail(deletedId) });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: documentKeys.all });

      toast.success("Document deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    },
  });
}

// Prefetch document
export function usePrefetchDocument() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: documentKeys.detail(id),
      queryFn: () => documentService.getDocument(id),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
}
